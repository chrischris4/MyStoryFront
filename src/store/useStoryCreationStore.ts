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
  storyPages: StoryPage[];
  storyId: string | null;
  isMinimized: boolean;
  startCreation: (title: string) => void;
  updateProgress: (pages: StoryPage[], storyId: string | null, loading: boolean) => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
};

export const useStoryCreationStore = create<StoryCreationState>((set) => ({
  isCreating: false,
  loading: false,
  title: '',
  storyPages: [],
  storyId: null,
  isMinimized: false,

  startCreation: (title: string) => set({
    isCreating: true,
    loading: true,
    title,
    storyPages: [],
    storyId: null,
    isMinimized: false
  }),

  updateProgress: (pages: StoryPage[], storyId: string | null, loading: boolean) =>
    set({ storyPages: pages, storyId, loading }),

  minimize: () => set({ isMinimized: true }),

  maximize: () => set({ isMinimized: false }),

  close: () => set({
    isCreating: false,
    loading: false,
    title: '',
    storyPages: [],
    storyId: null,
    isMinimized: false
  }),
}));
