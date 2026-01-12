import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type Story = {
  id: number;
  title: string;
  coverUrl?: string;
  createdAt: string;
  author?: {
    profil?: {
      name?: string;
    };
    email?: string;
  };
};

const fetchGroupStories = async (
  groupId: number,
  token: string | null
): Promise<Story[]> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group/${groupId}/stories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('❌ Error response:', errorData);
    throw new Error(errorData?.message || 'Erreur lors de la récupération des histoires du groupe');
  }

  const data = await response.json();
  return data;
};

export const useGroupStories = (groupId: number) => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['groupStories', groupId],
    queryFn: () => fetchGroupStories(groupId, accessToken),
    enabled: !!accessToken && !!groupId,
  });
};
