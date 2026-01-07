import React, { createContext, useEffect, ReactNode, useContext } from 'react';
import { useUserStore, User } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';
import { setupTokenRefresh, clearTokenRefresh } from '~/utils/authRefresh';

export type { User };

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData?: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  checkAuth: async () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  TOKEN: 'accessToken',
  USER: 'userData',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Utiliser le store Zustand
  const { user, accessToken: token, isAuthenticated, loadFromStorage, setUser, setTokens } = useUserStore();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    loadStoredAuth();

    // Configurer le rafraîchissement automatique du token
    if (token) {
      setupTokenRefresh();
    }

    return () => {
      clearTokenRefresh();
    };
  }, [token]);

  const loadStoredAuth = async () => {
    try {
      await loadFromStorage();

      // Si on a un token mais pas de user, on le récupère depuis l'API
      if (token && !user) {
        await fetchUserProfile(token);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'authentification:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Si le token n'est plus valide, on déconnecte
        await logout();
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    }
  };

  const login = async (newToken: string, userData?: User) => {
    try {
      if (userData) {
        // Utiliser le store Zustand pour sauvegarder
        await useUserStore.getState().login(userData, newToken, newToken); // refreshToken = accessToken pour l'instant
      } else {
        // Récupérer les infos utilisateur si non fournies
        const response = await fetch(`${API_BASE_URL}/profile/me`, {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        if (response.ok) {
          const userProfile = await response.json();
          await useUserStore.getState().login(userProfile, newToken, newToken);
        } else {
          throw new Error('Impossible de récupérer le profil utilisateur');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      clearTokenRefresh();
      await useUserStore.getState().logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return true;
      } else {
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
