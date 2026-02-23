import { useUserStore } from '~/store/useUserStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  token?: string | null;
  _isRetry?: boolean; // Flag interne pour éviter les boucles infinies
};

export class ApiService {
  private baseUrl: string;
  private onUnauthorized?: () => void;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  private getAuthToken(tokenOverride?: string | null): string | null {
    return tokenOverride ?? useUserStore.getState().accessToken;
  }

  private getRefreshToken(): string | null {
    return useUserStore.getState().refreshToken;
  }

  /**
   * Tente de rafraîchir le token
   * Retourne true si le refresh a réussi, false sinon
   */
  private async tryRefreshToken(): Promise<boolean> {
    // Si un refresh est déjà en cours, attendre son résultat
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefreshToken();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
     return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();


        // Mettre à jour AsyncStorage
        await AsyncStorage.setItem('accessToken', newAccessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);

        // Mettre à jour le store Zustand
        useUserStore.getState().setTokens(newAccessToken, newRefreshToken);

        return true;
      } else {
        console.error('❌ ApiService.tryRefreshToken - Refresh échoué, status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ ApiService.tryRefreshToken - Erreur:', error);
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
      token: tokenOverride,
      _isRetry = false,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken(tokenOverride);


    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requiresAuth && !token) {
      console.error('❌ ApiService.request - Pas de token');
      throw new ApiError('Non authentifié', 401);
    }

    if (requiresAuth) requestHeaders['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });


      
      if (response.status === 401 && requiresAuth && !_isRetry) {

        
        const refreshed = await this.tryRefreshToken();

        if (refreshed) {
          // Réessayer la requête avec le nouveau token
          return this.request<T>(endpoint, { ...options, _isRetry: true });
        }

        // Si refresh échoue, déclencher onUnauthorized
        console.error('❌ ApiService.request - Refresh échoué, déconnexion...');
        if (this.onUnauthorized) this.onUnauthorized();
        throw new ApiError('Session expirée', 401);
      }

      if (response.status === 401) {
        if (this.onUnauthorized) this.onUnauthorized();
        throw new ApiError('Session expirée', 401);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ ApiService.request - Erreur HTTP', response.status, errorData);
        throw new ApiError(
          errorData?.message || `Erreur HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      }

      return {} as T;
    } catch (error) {
      console.error('❌ ApiService.request - Exception', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(error instanceof Error ? error.message : 'Erreur réseau', 0);
    }
  }

  // Méthodes HTTP de base
  async get<T>(endpoint: string, requiresAuth = true, token?: string) {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth, token });
  }
  async post<T>(endpoint: string, body?: any, requiresAuth = true, token?: string) {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth, token });
  }
  async put<T>(endpoint: string, body?: any, requiresAuth = true, token?: string) {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth, token });
  }
  async patch<T>(endpoint: string, body?: any, requiresAuth = true, token?: string) {
    return this.request<T>(endpoint, { method: 'PATCH', body, requiresAuth, token });
  }
  async delete<T>(endpoint: string, body?: any, requiresAuth = true, token?: string) {
    return this.request<T>(endpoint, { method: 'DELETE', body, requiresAuth, token });
  }

  // --- Auth ---
  async login(email: string, password: string) {
    return this.post<{ accessToken: string; refreshToken: string }>('/auth/login', { email, password }, false);
  }

  async register(email: string, password: string, username?: string) {
    return this.post<{ accessToken: string; refreshToken: string }>('/auth/register', { email, password, username }, false);
  }

  async oauthLogin(provider: 'google', accessToken: string, name?: string) {
    return this.post<{ accessToken: string; refreshToken: string }>('/auth/oauth', { provider, accessToken, name }, false);
  }

  async forgotPassword(email: string) {
    return this.post<{ message: string }>('/auth/forgot-password', { email }, false);
  }

  async verifyResetCode(email: string, code: string) {
    return this.post<{ valid: boolean; message: string }>('/auth/verify-reset-code', { email, code }, false);
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    return this.post<{ message: string; accessToken?: string; refreshToken?: string }>('/auth/reset-password', { email, code, newPassword }, false);
  }

  async getProfile() {
    return this.get<any>('/profile/me');
  }

  // --- Stories ---
  async getStories() {
    return this.get<any[]>('/story');
  }

  async getSharedStories() {
    return this.get<any[]>('/story/shared');
  }

  async getSharedStoriesGroup(storyId: number) {
    return this.get<any[]>(`/story/${storyId}/groups`);
  }

  async getStoryDetail(id: number) {
    return this.get<any>(`/story/detail/${id}`);
  }

  async toggleStoryShared(id: number) {
    return this.patch<any>(`/story/${id}/toggle-shared`);
  }

  async deleteStory(id: number) {
    return this.delete<any>(`/story/${id}`);
  }

  async getStoryStatus(id: number) {
    return this.get<{ status: string; progress?: number; failureReason?: string }>(`/story/${id}/status`);
  }

  // --- Favoris ---
  async getFavoriteStories() {
    return this.get<any[]>('/favorite-story/me');
  }
  async addFavorite(storyId: number) {
    return this.post<any>('/favorite-story', { storyId });
  }
  async removeFavorite(storyId: number) {
    return this.delete<any>('/favorite-story', { storyId });
  }

  // --- Groupes ---
  async getMyGroups() {
    return this.get<any[]>('/group');
  }
  async getGroupMembers(groupId: number) {
    return this.get<any[]>(`/group/${groupId}/members`);
  }
  async getGroupStories(groupId: number) {
    return this.get<any[]>(`/group/${groupId}/stories`);
  }
  async getGroupInvitations() {
    return this.get<any[]>('/group/invitations');
  }
  async createGroup(dto: any) {
    return this.post<any>('/group', dto);
  }
  async shareStoryWithGroup(groupId: number, storyId: number) {
    return this.post(`/group/${groupId}/share`, { storyId });
  }
  async unshareStoryFromGroup(groupId: number, storyId: number) {
    return this.delete(`/group/${groupId}/share`, { storyId });
  }
  async acceptInvitation(invitationId: number) {
    return this.post(`/group/invitations/${invitationId}/accept`);
  }
  async declineInvitation(invitationId: number) {
    return this.post(`/group/invitations/${invitationId}/decline`);
  }
  async leaveGroup(groupId: number) {
    return this.post(`/group/${groupId}/leave`);
  }
  async removeMember(groupId: number, memberId: number) {
    return this.delete(`/group/${groupId}/members/${memberId}`);
  }

  // --- Transactions ---
  async getUserTransactions() {
    return this.get<any[]>('/transaction');
  }

  // --- User ---
  async deleteUser() {
    return this.delete<{ message: string }>(`/user/me`);
  }

  // --- Reports ---
  async reportStory(dto: { storyId: number; reason: string; message?: string }) {
    return this.post<any>('/report', dto);
  }

  async hasReportedStory(storyId: number) {
    return this.get<{ hasReported: boolean }>(`/report/check?storyId=${storyId}`);
  }

  // --- Characters ---
  async getCharacters() {
    return this.get<any[]>('/character');
  }

  async getCharacter(id: number) {
    return this.get<any>(`/character/${id}`);
  }

  async createCharacter(dto: any) {
    return this.post<any>('/character', dto);
  }

  async updateCharacter(id: number, dto: any) {
    return this.patch<any>(`/character/${id}`, dto);
  }

  async deleteCharacter(id: number) {
    return this.delete<any>(`/character/${id}`);
  }
}

// --- Instance singleton ---
export const api = new ApiService(API_BASE_URL);
export const useApi = () => api;
