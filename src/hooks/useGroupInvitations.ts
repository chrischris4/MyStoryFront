import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

export type GroupInvitation = {
  id: number;
  groupId: number;
  inviterId: number;
  inviteeId: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  group: {
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
    _count?: {
      members: number;
    };
  };
  inviter: {
    id: number;
    profil: {
      name: string;
      imageUrl?: string;
    };
  };
};

const fetchInvitations = async (token: string | null): Promise<GroupInvitation[]> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group/invitations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des invitations');
  }

  const data = await response.json();
  return data;
};

export const useGroupInvitations = () => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['groupInvitations'],
    queryFn: () => fetchInvitations(accessToken),
    staleTime: 1000 * 60 * 2, // Les données sont considérées comme fraîches pendant 2 minutes
    retry: 2,
    enabled: !!accessToken,
  });
};
