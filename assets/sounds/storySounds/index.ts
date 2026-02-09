// Liste des musiques disponibles pour le lecteur d'histoires
// Pour ajouter une nouvelle musique :
// 1. Ajouter le fichier .mp3 dans ce dossier
// 2. Ajouter une entrée dans STORY_MUSICS avec require()

export type MusicCategory = 'calm' | 'adventure' | 'epic' | 'fun';

export type StoryMusic = {
  id: string;
  name: string;
  emoji: string;
  category: MusicCategory;
  source: any;
};

export const MUSIC_CATEGORIES: { id: MusicCategory; emoji: string; translationKey: string }[] = [
  { id: 'calm', emoji: '🌙', translationKey: 'storyReader.categories.calm' },
  { id: 'adventure', emoji: '🗺️', translationKey: 'storyReader.categories.adventure' },
  { id: 'epic', emoji: '⚔️', translationKey: 'storyReader.categories.epic' },
  { id: 'fun', emoji: '🎉', translationKey: 'storyReader.categories.fun' },
];

export const STORY_MUSICS: StoryMusic[] = [
  {
    id: 'CALME',
    name: 'Sous la lune',
    emoji: '🎶',
    category: 'calm',
    source: require('./CALME.mp3'),
  },
  {
    id: 'CALME2',
    name: 'Sous les étoiles',
    emoji: '🎶',
    category: 'calm',
    source: require('./CALME2.mp3'),
  },
  {
    id: 'CALME3',
    name: 'Sous les planètes',
    emoji: '🎶',
    category: 'calm',
    source: require('./CALME3.mp3'),
  },
  {
    id: 'AVENTURE',
    name: 'Belle aventure',
    emoji: '🎶',
    category: 'adventure',
    source: require('./AVENTURE.mp3'),
  },
  {
    id: 'AVENTURE2',
    name: 'Joyeuse aventure',
    emoji: '🎶',
    category: 'adventure',
    source: require('./AVENTURE2.mp3'),
  },
  {
    id: 'AVENTURE3',
    name: 'Calme aventure',
    emoji: '🎶',
    category: 'adventure',
    source: require('./AVENTURE3.mp3'),
  },
  {
    id: 'EPIC',
    name: 'Aventure courageuse',
    emoji: '🎶',
    category: 'epic',
    source: require('./EPIC.mp3'),
  },
  {
    id: 'EPIC2',
    name: 'Aventure de héros',
    emoji: '🎶',
    category: 'epic',
    source: require('./EPIC2.mp3'),
  },
  {
    id: 'EPIC3',
    name: 'Aventure épique',
    emoji: '🎶',
    category: 'epic',
    source: require('./EPIC3.mp3'),
  },
  {
    id: 'FUN',
    name: 'Balade de rires',
    emoji: '🎶',
    category: 'fun',
    source: require('./FUN.mp3'),
  },
  {
    id: 'FUN2',
    name: 'Balade enjouée',
    emoji: '🎶',
    category: 'fun',
    source: require('./FUN2.mp3'),
  },
  {
    id: 'FUN3',
    name: 'Balade joyeuse',
    emoji: '🎶',
    category: 'fun',
    source: require('./FUN3.mp3'),
  },
];
