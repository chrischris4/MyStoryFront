import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'lastSeenStoriesAt';

type NotificationStore = {
  lastSeenStoriesAt: Record<number, number>;
  markStoriesSeen: (groupId: number) => Promise<void>;
  getNewStoriesCount: (groupId: number, stories: { createdAt: string }[]) => number;
  loadFromStorage: () => Promise<void>;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  lastSeenStoriesAt: {},

  markStoriesSeen: async (groupId: number) => {
    const now = Date.now();
    const updated = { ...get().lastSeenStoriesAt, [groupId]: now };
    set({ lastSeenStoriesAt: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getNewStoriesCount: (groupId: number, stories: { createdAt: string }[]) => {
    const lastSeen = get().lastSeenStoriesAt[groupId];
    if (!lastSeen) return stories.length;
    return stories.filter(s => new Date(s.createdAt).getTime() > lastSeen).length;
  },

  loadFromStorage: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      set({ lastSeenStoriesAt: JSON.parse(stored) });
    }
  },
}));
