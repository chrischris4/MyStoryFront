import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

const fetchSharedStories = async (token: string | null) => {
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/story/shared`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Erreur lors du chargement des histoires partagées');

  return response.json();
};

export const useSharedStories = () => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['sharedStories'],
    queryFn: () => fetchSharedStories(accessToken),
    enabled: !!accessToken,
  });
};
