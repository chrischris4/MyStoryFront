
export type MusicCategory = 'calm' | 'adventure' | 'epic' | 'fun';

export type StoryMusic = {
  id: string;
  translationKey: string;
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
    translationKey: 'storyReader.musics.calm1',
    emoji: '🎶',
    category: 'calm',
    source: require('./CALME.mp3'),
  },
  {
    id: 'CALME2',
    translationKey: 'storyReader.musics.calm2',
    emoji: '🎶',
    category: 'calm',
    source: require('./CALME2.mp3'),
  },
  {
    id: 'CALME3',
    translationKey: 'storyReader.musics.calm3',
    emoji: '🎶',
    category: 'calm',
    source: require('./CALME3.mp3'),
  },
  {
    id: 'AVENTURE',
    translationKey: 'storyReader.musics.adventure1',
    emoji: '🎶',
    category: 'adventure',
    source: require('./AVENTURE.mp3'),
  },
  {
    id: 'AVENTURE2',
    translationKey: 'storyReader.musics.adventure2',
    emoji: '🎶',
    category: 'adventure',
    source: require('./AVENTURE2.mp3'),
  },
  {
    id: 'AVENTURE3',
    translationKey: 'storyReader.musics.adventure3',
    emoji: '🎶',
    category: 'adventure',
    source: require('./AVENTURE3.mp3'),
  },
  {
    id: 'EPIC',
    translationKey: 'storyReader.musics.epic1',
    emoji: '🎶',
    category: 'epic',
    source: require('./EPIC.mp3'),
  },
  {
    id: 'EPIC2',
    translationKey: 'storyReader.musics.epic2',
    emoji: '🎶',
    category: 'epic',
    source: require('./EPIC2.mp3'),
  },
  {
    id: 'EPIC3',
    translationKey: 'storyReader.musics.epic3',
    emoji: '🎶',
    category: 'epic',
    source: require('./EPIC3.mp3'),
  },
  {
    id: 'FUN',
    translationKey: 'storyReader.musics.fun1',
    emoji: '🎶',
    category: 'fun',
    source: require('./FUN.mp3'),
  },
  {
    id: 'FUN2',
    translationKey: 'storyReader.musics.fun2',
    emoji: '🎶',
    category: 'fun',
    source: require('./FUN2.mp3'),
  },
  {
    id: 'FUN3',
    translationKey: 'storyReader.musics.fun3',
    emoji: '🎶',
    category: 'fun',
    source: require('./FUN3.mp3'),
  },
];
