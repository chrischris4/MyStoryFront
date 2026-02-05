import { useFavoriteStories } from './useFavoriteStories';

export const useCheckFavorite = (storyId: number) => {
  const { data: favorites = [], isLoading } = useFavoriteStories();
  const isFavorite = favorites.some((s: any) => s.id === storyId);

  return {
    data: isFavorite,
    isLoading,
  };
};
