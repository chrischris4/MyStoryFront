import { Group } from '~/hooks/useGroups';
import { useUserStore } from '~/store/useUserStore';

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
};

class ApiService {
  private baseUrl: string;
  private onUnauthorized?: () => void;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  private getAuthToken(): string | null {
    return useUserStore.getState().accessToken;
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
    } = options;

    const url = `${this.baseUrl}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Ajouter le token d'authentification si nécessaire
    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      } else {
        throw new ApiError('Non authentifié', 401);
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      // Gérer les erreurs 401 (non autorisé)
      if (response.status === 401) {
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
        throw new ApiError('Session expirée', 401);
      }

      // Gérer les autres erreurs HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          errorData?.message || `Erreur HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      // Gérer les réponses vides (ex: DELETE)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Erreur réseau',
        0
      );
    }
  }

  // Méthodes HTTP de base
  async get<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  async put<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  async patch<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, requiresAuth });
  }

  async delete<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', body, requiresAuth });
  }

  // Méthodes spécifiques pour l'authentification
  async login(email: string, password: string) {
    return this.post<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      { email, password },
      false
    );
  }

  async register(email: string, password: string, username?: string) {
    return this.post<{ accessToken: string; refreshToken: string }>( // ← Ajouter refreshToken
      '/auth/register',
      { email, password, username },
      false
    );
  }

  async getProfile() {
    return this.get<any>('/profile/me');
  }

  // Méthodes pour les stories
  async getStories() {
    return this.get<any[]>('/story');
  }

  async getSharedStories() {
    return this.get<any[]>('/story/shared');
  }

    async getSharedStoriesGroup(id: number) {
    return this.get<any[]>(`/story/${id}/shared-groups`);
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

  // Méthodes pour les favoris
  async getFavoriteStories() {
    return this.get<any[]>('/favorite-story/me');
  }

  async addFavorite(storyId: number) {
    return this.post<any>('/favorite-story', { storyId });
  }

  async removeFavorite(storyId: number) {
    return this.delete<any>('/favorite-story', { storyId });
  }

  // Groupes
async getMyGroups() {
  return this.get<Group[]>(`/group`);
}

async getGroupMembers(groupId: number) {
  return this.get<any[]>(`/group/${groupId}/members`);
}

async createGroup(dto: any) {
  return this.post<Group>(`/group`, dto);
}

async shareStoryWithGroup(groupId: number, storyId: number) {
  return this.post(`/group/${groupId}/share`, { storyId });
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

}

// Instance singleton
export const api = new ApiService(API_BASE_URL);

// Hook pour faciliter l'utilisation dans les composants
export const useApi = () => api;
