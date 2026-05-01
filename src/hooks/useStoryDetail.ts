import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';
import type { Story } from '~/types';

const fetchStoryDetail = async (storyId: number, token: string | null): Promise<Story> => {
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/story/detail/${storyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 403) {
    const data = await response.json().catch(() => ({}));
    throw Object.assign(new Error(data.message || 'Accès refusé'), { status: 403 });
  }

  if (!response.ok) throw new Error('Erreur lors du chargement de l\'histoire');

  return response.json();
};

export const useStoryDetail = (storyId: number) => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['storyDetail', storyId],
    queryFn: () => fetchStoryDetail(storyId, accessToken),
    enabled: !!accessToken && !!storyId,
    staleTime: 1000 * 60 * 5,
  });
};
