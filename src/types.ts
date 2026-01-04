export type RootStackParamList = {
  Home: undefined;
  Stories: undefined;
  SharedStories: undefined;
  CreateStory: undefined;
  StoryDetail: { storyId: number };
};

export type Page = {
  id: number;
  pageIndex: number;
  text: string;
  imageUrl: string;
};

export type Story = {
  id: number;
  title: string;
  pages: Page[];
  isShared?: boolean;
};
