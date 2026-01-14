import { useQuery } from '@tanstack/react-query';
import { api } from '~/services/api';

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

export const useGroupInvitations = () => {
  return useQuery({
    queryKey: ['groupInvitations'],
    queryFn: () => api.getGroupInvitations(),
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};
