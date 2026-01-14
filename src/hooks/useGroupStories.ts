import { useQuery } from '@tanstack/react-query';
import { api } from '~/services/api';

export const useGroupStories = (groupId: number) => {
  return useQuery({
    queryKey: ['groupStories', groupId],
    queryFn: () => api.getGroupStories(groupId),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!groupId,
  });
};
