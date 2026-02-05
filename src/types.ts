// Stack Navigator - écrans principaux et modaux
export type RootStackParamList = {
  Opening: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
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
  characters?: Character[]; // Relation many-to-many (max 2 personnages)
  numberOfPages?: number;
  language?: string;
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

// ==================== HELPER FUNCTIONS ====================

// Modificateurs de teint de peau pour les emojis
const SKIN_TONE_MODIFIERS: Record<string, string> = {
  'light': '🏻',
  'medium-light': '🏼',
  'medium': '🏽',
  'medium-dark': '🏾',
  'dark': '🏿',
};

// Emojis de base par genre et tranche d'âge
const HUMAN_EMOJIS = {
  // Enfants (0-12 ans)
  child: { MALE: '👦', FEMALE: '👧', default: '🧒' },
  // Adolescents/Jeunes adultes (13-25 ans)
  teen: { MALE: '👦', FEMALE: '👧', default: '🧒' },
  // Adultes (26-59 ans)
  adult: { MALE: '👨', FEMALE: '👩', default: '🧑' },
  // Seniors (60+ ans)
  senior: { MALE: '👴', FEMALE: '👵', default: '🧓' },
};

/**
 * Génère un emoji approprié pour un personnage humain
 * basé sur son âge, genre et couleur de peau
 */
export const getHumanEmoji = (character: Character): string => {
  if (character.type !== 'HUMAN') {
    return ANIMAL_TYPES.find((a) => a.id === character.animalType)?.emoji || '🐾';
  }

  // Déterminer la tranche d'âge
  const age = character.age || 25; // Par défaut adulte
  let ageGroup: 'child' | 'teen' | 'adult' | 'senior';

  if (age <= 12) {
    ageGroup = 'child';
  } else if (age <= 25) {
    ageGroup = 'teen';
  } else if (age <= 59) {
    ageGroup = 'adult';
  } else {
    ageGroup = 'senior';
  }

  // Obtenir l'emoji de base selon le genre
  const gender = character.gender || 'default';
  const baseEmoji = HUMAN_EMOJIS[ageGroup][gender as keyof typeof HUMAN_EMOJIS.child]
    || HUMAN_EMOJIS[ageGroup].default;

  // Ajouter le modificateur de teint de peau si disponible
  const skinModifier = character.skinColor
    ? SKIN_TONE_MODIFIERS[character.skinColor] || ''
    : '';

  return baseEmoji + skinModifier;
};
