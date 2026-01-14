import { useQuery } from '@tanstack/react-query';
import { api } from '~/services/api';


export const useGroupMembers = (groupId: number) => {
  return useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: async () => {
      const data = await api.getGroupMembers(groupId);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!groupId,
  });
};