import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';
import type { Group } from './useGroups';

const searchGroups = async (
  query: string,
  token: string | null
): Promise<Group[]> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  if (!query || query.trim().length === 0) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/group/search?q=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la recherche de groupes');
  }

  const data = await response.json();
  return data;
};

export const useSearchGroups = (query: string) => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['searchGroups', query],
    queryFn: () => searchGroups(query, accessToken),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!accessToken && query.trim().length > 0,
  });
};
