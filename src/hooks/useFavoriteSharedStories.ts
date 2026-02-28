import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

const fetchFavoriteSharedStories = async (token: string | null) => {
  if (!token) throw new Error('Utilisateur non authentifié');

  const response = await fetch(`${API_BASE_URL}/story/shared/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Erreur lors de la récupération des histoires populaires');

  return response.json();
};

export const useFavoriteSharedStories = () => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['sharedStories', 'favorites'],
    queryFn: () => fetchFavoriteSharedStories(accessToken),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!accessToken,
  });
};
