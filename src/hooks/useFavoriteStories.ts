import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

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

  const response = await fetch(`${API_BASE_URL}/favorite-story/me`, {
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
    queryFn: () => {
      // Récupérer le token frais à chaque query
      const freshToken = useUserStore.getState().accessToken;
      return fetchFavoriteStories(freshToken);
    },
    staleTime: 0, // Toujours refetch au montage
    retry: 2, // Réessayer 2 fois en cas d'erreur
    enabled: !!accessToken, // Ne lance la requête que si on a un token
  });
};
