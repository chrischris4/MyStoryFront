import { useQuery } from '@tanstack/react-query';
import { api } from '~/services/api';


export const useStoryGroups = (storyId: number) => {
  return useQuery({
    queryKey: ['storyGroups', storyId],
    queryFn: async () => {
      const data = await api.getSharedStoriesGroup(storyId);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!storyId,
  });
};
