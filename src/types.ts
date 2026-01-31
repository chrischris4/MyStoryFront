// Stack Navigator - écrans principaux et modaux
export type RootStackParamList = {
  Opening: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  StoryDetail: { storyId: number };
  BillingScreen: undefined;
  GroupScreen: undefined;
  CompleteProfileScreen: { accessToken: string; refreshToken: string };
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
  description?: string;
  pages: Page[];
  isShared?: boolean;
  createdAt?: string;
  user?: User;
  coverUrl?: string;
  character?: Character;
};

// ==================== CHARACTER TYPES ====================

export type CharacterType = 'HUMAN' | 'ANIMAL';

export type Character = {
  id: number;
  name: string;
  type: CharacterType;
  gender?: 'MALE' | 'FEMALE';
  age?: number; // Pour humains
  animalAge?: 'YOUNG' | 'ADULT' | 'OLD'; // Pour animaux
  description?: string;
  imageUrl?: string;
  // Champs humains
  skinColor?: string;
  hairColor?: string;
  eyeColor?: string;
  clothing?: string;
  // Champs animaux
  animalType?: string;
  furColor?: string;
  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    stories: number;
  };
};

export type Gender = 'MALE' | 'FEMALE';
export type AnimalAge = 'YOUNG' | 'ADULT' | 'OLD';

export type CreateCharacterInput = {
  name: string;
  type: CharacterType;
  gender?: Gender;
  age?: number; // Pour humains
  animalAge?: AnimalAge; // Pour animaux
  description?: string;
  skinColor?: string;
  hairColor?: string;
  eyeColor?: string;
  clothing?: string;
  animalType?: string;
  furColor?: string;
};

export type UpdateCharacterInput = Partial<CreateCharacterInput>;

// ==================== CHARACTER OPTIONS ====================

export type CharacterOption = {
  id: string;
  label: string;
  emoji?: string;
};

export const SKIN_COLORS: CharacterOption[] = [
  { id: 'light', label: 'Claire', emoji: '🧒🏻' },
  { id: 'medium-light', label: 'Mate claire', emoji: '🧒🏼' },
  { id: 'medium', label: 'Mate', emoji: '🧒🏽' },
  { id: 'medium-dark', label: 'Mate foncée', emoji: '🧒🏾' },
  { id: 'dark', label: 'Foncée', emoji: '🧒🏿' },
];

export const HAIR_COLORS: CharacterOption[] = [
  { id: 'blond', label: 'Blond' },
  { id: 'brown', label: 'Brun' },
  { id: 'black', label: 'Noir' },
  { id: 'red', label: 'Roux' },
  { id: 'gray', label: 'Gris' },
  { id: 'white', label: 'Blanc' },
];

export const EYE_COLORS: CharacterOption[] = [
  { id: 'brown', label: 'Marron' },
  { id: 'blue', label: 'Bleu' },
  { id: 'green', label: 'Vert' },
  { id: 'hazel', label: 'Noisette' },
  { id: 'gray', label: 'Gris' },
];

export const ANIMAL_TYPES: CharacterOption[] = [
  { id: 'dog', label: 'Chien', emoji: '🐕' },
  { id: 'cat', label: 'Chat', emoji: '🐱' },
  { id: 'rabbit', label: 'Lapin', emoji: '🐰' },
  { id: 'bird', label: 'Oiseau', emoji: '🐦' },
  { id: 'horse', label: 'Cheval', emoji: '🐴' },
  { id: 'dragon', label: 'Dragon', emoji: '🐲' },
  { id: 'unicorn', label: 'Licorne', emoji: '🦄' },
  { id: 'bear', label: 'Ours', emoji: '🐻' },
];

export const FUR_COLORS: CharacterOption[] = [
  { id: 'white', label: 'Blanc' },
  { id: 'black', label: 'Noir' },
  { id: 'brown', label: 'Brun' },
  { id: 'golden', label: 'Doré' },
  { id: 'gray', label: 'Gris' },
  { id: 'spotted', label: 'Tacheté' },
  { id: 'rainbow', label: 'Arc-en-ciel' },
];

export const GENDERS: CharacterOption[] = [
  { id: 'MALE', label: 'Masculin'},
  { id: 'FEMALE', label: 'Féminin'},
];

export const ANIMAL_AGE_RANGES: CharacterOption[] = [
  { id: 'YOUNG', label: 'Jeune'},
  { id: 'ADULT', label: 'Adulte'},
  { id: 'OLD', label: 'Vieux'},
];
