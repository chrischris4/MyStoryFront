// Stack Navigator - écrans principaux et modaux
export type RootStackParamList = {
  Opening: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  StoryDetail: { storyId: number };
  BillingScreen: undefined;
  CompleteProfileScreen: { accessToken: string };
};

// Tab Navigator - écrans avec BottomNavBar
export type MainTabParamList = {
  Home: undefined;
  Stories: undefined;
  SharedStories: undefined;
  CreateStory: undefined;
  SettingsScreen: undefined;
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
