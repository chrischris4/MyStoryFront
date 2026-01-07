import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

const checkFavorite = async (
  storyId: number,
  token: string | null
): Promise<boolean> => {
  if (!token) {
    throw new Error('Utilisateur non connecté');
  }

  const response = await fetch(`${API_BASE_URL}/favorite-story/check/${storyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la vérification du favori');
  }

  const data = await response.json();
  return data.isFavorite;
};

export const useCheckFavorite = (storyId: number) => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['checkFavorite', storyId],
    queryFn: () => {
      // Récupérer le token frais à chaque query
      const freshToken = useUserStore.getState().accessToken;
      return checkFavorite(storyId, freshToken);
    },
    staleTime: 1000 * 60 * 5, // Les données sont considérées comme fraîches pendant 5 minutes
    retry: 2,
    enabled: !!accessToken && !!storyId, // Ne lance la requête que si on a un token et un storyId
  });
};
