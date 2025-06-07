export type RootStackParamList = {
  Home: undefined;
  Stories: undefined;
  CreateStory: undefined;
  StoryDetail: undefined;
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
};
