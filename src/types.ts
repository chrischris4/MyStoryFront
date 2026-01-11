// Stack Navigator - écrans principaux et modaux
export type RootStackParamList = {
  Opening: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  StoryDetail: { storyId: number };
  BillingScreen: undefined;
  GroupScreen: undefined;
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

export type Profil = {
  id: number;
  name?: string;
  imageUrl?: string;
};

export type User = {
  id: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  isAnonymous: boolean;
  profil?: Profil;
};

export type Story = {
  id: number;
  title: string;
  pages: Page[];
  isShared?: boolean;
  createdAt?: string;
  user?: User;
};
