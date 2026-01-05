// stores/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '~/types';


type UserState = {
  user: User | null;
  isHydrated: boolean;

  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,

      setUser: (user) => set({ user }),

      updateUser: (partial) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, ...partial } }
            : {}
        ),

      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',

      onRehydrateStorage: () => () => {
        useUserStore.setState({ isHydrated: true });
      },
    }
  )
);
