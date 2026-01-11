import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

export type GroupMember = {
  id: number;
  userId: number;
  groupId: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: number;
    email: string;
    profil: {
      name: string;
      imageUrl?: string;
    };
  };
};

const fetchGroupMembers = async (
  groupId: number,
  token: string | null
): Promise<GroupMember[]> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group/${groupId}/members`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des membres');
  }

  const data = await response.json();
  return data;
};

export const useGroupMembers = (groupId: number) => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => fetchGroupMembers(groupId, accessToken),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!accessToken && !!groupId,
  });
};
