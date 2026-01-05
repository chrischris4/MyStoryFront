import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';

type FavoriteStory = {
  id: string;
  title: string;
  prompt: string;
  style: string;
  numberOfPages: number;
  createdAt: string;
  pages: {
    page: number;
    text: string;
    imageUrl: string;
  }[];
};

const fetchFavoriteStories = async (token: string | null): Promise<FavoriteStory[]> => {
  if (!token) {
    throw new Error('Utilisateur non connecté');
  }

  const response = await fetch('http://192.168.1.95:3000/favorite-story/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des histoires favorites');
  }

  const data = await response.json();
  return data;
};

export const useFavoriteStories = () => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['favoriteStories'],
    queryFn: () => fetchFavoriteStories(accessToken),
    staleTime: 1000 * 60 * 5, // Les données sont considérées comme fraîches pendant 5 minutes
    retry: 2, // Réessayer 2 fois en cas d'erreur
    enabled: !!accessToken, // Ne lance la requête que si on a un token
  });
};
