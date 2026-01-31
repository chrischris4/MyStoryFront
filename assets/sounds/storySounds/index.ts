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
    id: 'instant-crush',
    name: 'Instant Crush',
    emoji: '🎵',
    source: require('./Daft Punk - Instant Crush (Lyrics) ft. Julian Casablancas.mp3'),
  },
  // Ajouter d'autres musiques ici :
  // {
  //   id: 'nom-unique',
  //   name: 'Nom affiché',
  //   emoji: '🎶',
  //   source: require('./nom-du-fichier.mp3'),
  // },
];
