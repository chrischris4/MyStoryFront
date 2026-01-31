import { create } from 'zustand';

type StoryPage = {
  page: number;
  text: string;
  imageUrl: string;
};

type StoryCreationState = {
  isCreating: boolean;
  loading: boolean;
  title: string;
  description: string | null;
  coverUrl: string | null;
  storyPages: StoryPage[];
  storyId: string | null;
  isMinimized: boolean;
  startCreation: (title: string) => void;
  updateProgress: (pages: StoryPage[], storyId: string | null, coverUrl: string | null, description: string | null, loading: boolean) => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
};

export const useStoryCreationStore = create<StoryCreationState>((set) => ({
  isCreating: false,
  loading: false,
  title: '',
  description: null,
  coverUrl: null,
  storyPages: [],
  storyId: null,
  isMinimized: false,

  startCreation: (title: string) => set({
    isCreating: true,
    loading: true,
    title,
    description: null,
    coverUrl: null,
    storyPages: [],
    storyId: null,
    isMinimized: false
  }),

  updateProgress: (pages: StoryPage[], storyId: string | null, coverUrl: string | null, description: string | null, loading: boolean) =>
    set({ storyPages: pages, storyId, coverUrl, description, loading }),

  minimize: () => set({ isMinimized: true }),

  maximize: () => set({ isMinimized: false }),

  close: () => set({
    isCreating: false,
    loading: false,
    title: '',
    description: null,
    coverUrl: null,
    storyPages: [],
    storyId: null,
    isMinimized: false
  }),
}));
