import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionPlan = 'FREE' | 'EXPLORER' | 'ADVENTURER' | 'LEGEND';

// Helper function pour vérifier si l'utilisateur est premium
export const isPremiumUser = (subscriptionPlan?: SubscriptionPlan): boolean => {
  return subscriptionPlan !== undefined && subscriptionPlan !== 'FREE';
};

export type User = {
  id: number;
  email: string;
  name?: string;
  imageUrl?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  storyCoin?: number;
  createdAt?: string;
  updatedAt?: string;
  subscriptionPlan?: SubscriptionPlan;
  profil?: {
    name?: string;
    imageUrl?: string;
  };
};

type UserStore = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  updateProfile: (profile: { name?: string; imageUrl?: string | null }) => Promise<void>;
  decrementStoryCoin: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

  login: async (user, accessToken, refreshToken) => {
    // Sauvegarder dans AsyncStorage
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    // Mettre à jour le store
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    // Nettoyer AsyncStorage
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');

    // Réinitialiser le store
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  loadFromStorage: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userString = await AsyncStorage.getItem('user');

      if (accessToken && userString) {
        const user = JSON.parse(userString);
        set({
          user,
          accessToken,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement depuis AsyncStorage:', error);
    }
  },

  decrementStoryCoin: () => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, storyCoin: Math.max(0, (state.user.storyCoin ?? 0) - 1) };
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  updateProfile: async (profile) => {
    set((state) => {
      if (!state.user) return state;

      const updatedProfil = {
        ...state.user.profil,
        ...(profile.name !== undefined && { name: profile.name }),
        ...(profile.imageUrl !== undefined && { imageUrl: profile.imageUrl ?? undefined }),
      };

      const updatedUser = {
        ...state.user,
        profil: updatedProfil,
      };

      // Sauvegarder dans AsyncStorage
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      return { user: updatedUser };
    });
  },
}));
