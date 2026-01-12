import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type Group = {
  id: number;
  name: string;
  _count?: {
    members: number;
  };
};

const fetchStoryGroups = async (
  storyId: number,
  token: string | null
): Promise<Group[]> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  console.log(`🌐 Fetching story groups from: ${API_BASE_URL}/story/${storyId}/groups`);

  const response = await fetch(`${API_BASE_URL}/story/${storyId}/groups`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`📡 Response status: ${response.status}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('❌ Error response:', errorData);
    throw new Error(errorData?.message || 'Erreur lors de la récupération des groupes de l\'histoire');
  }

  const data = await response.json();
  console.log('✅ Story groups fetched:', data);
  return data;
};

export const useStoryGroups = (storyId: number) => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['storyGroups', storyId],
    queryFn: () => fetchStoryGroups(storyId, accessToken),
    enabled: !!accessToken && !!storyId,
  });
};
