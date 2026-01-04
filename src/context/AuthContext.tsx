import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  id: number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
};

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Si on a un token mais pas de user, on le récupère depuis l'API
          await fetchUserProfile(storedToken);
        }
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
      const response = await fetch('http://192.168.1.95:3000/profile/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
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
      // Toujours mettre à jour le token en premier
      setToken(newToken);
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      } else {
        // Récupérer les infos utilisateur si non fournies
        // IMPORTANT: On attend que fetchUserProfile se termine
        const response = await fetch('http://192.168.1.95:3000/profile/me', {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        if (response.ok) {
          const userProfile = await response.json();
          setUser(userProfile);
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
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
      setToken(null);
      setUser(null);
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await fetch('http://192.168.1.95:3000/profile/me', {
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

  const isAuthenticated = !!token && !!user;

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
