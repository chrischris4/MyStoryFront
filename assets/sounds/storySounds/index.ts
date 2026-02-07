// Liste des musiques disponibles pour le lecteur d'histoires
// Pour ajouter une nouvelle musique :
// 1. Ajouter le fichier .mp3 dans ce dossier
// 2. Ajouter une entrée dans STORY_MUSICS avec require()

export type StoryMusic = {
  id: string;
  name: string;
  emoji: string;
  source: any;
};

export const STORY_MUSICS: StoryMusic[] = [
  {
    id: 'EPIC',
    name: 'Aventure courageuse',
    emoji: '🎶',
    source: require('./EPIC.mp3'),
  },
  {
    id: 'EPIC2',
    name: 'Aventure de héros',
    emoji: '🎶',
    source: require('./EPIC2.mp3'),
  },
  {
    id: 'EPIC3',
    name: 'Aventure épique',
    emoji: '🎶',
    source: require('./EPIC3.mp3'),
  },
  {
    id: 'AVENTURE',
    name: 'Belle aventure',
    emoji: '🎶',
    source: require('./AVENTURE.mp3'),
  },
  {
    id: 'AVENTURE2',
    name: 'Joyeuse aventure',
    emoji: '🎶',
    source: require('./AVENTURE2.mp3'),
  },
  {
    id: 'AVENTURE3',
    name: 'Calme aventure',
    emoji: '🎶',
    source: require('./AVENTURE3.mp3'),
  },
  {
    id: 'CALME',
    name: 'Sous la lune',
    emoji: '🎶',
    source: require('./CALME.mp3'),
  },
  {
    id: 'CALME2',
    name: 'Sous les étoiles',
    emoji: '🎶',
    source: require('./CALME2.mp3'),
  },
  {
    id: 'CALME3',
    name: 'Sous les planètes',
    emoji: '🎶',
    source: require('./CALME3.mp3'),
  },
  {
    id: 'FUN',
    name: 'Balade de rires',
    emoji: '🎶',
    source: require('./FUN.mp3'),
  },
  {
    id: 'FUN2',
    name: 'Balade enjouée',
    emoji: '🎶',
    source: require('./FUN2.mp3'),
  },
  {
    id: 'FUN3',
    name: 'Balade joyeuse',
    emoji: '🎶',
    source: require('./FUN3.mp3'),
  },
];
