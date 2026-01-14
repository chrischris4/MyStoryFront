import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';

type ShareStoryInput = {
  groupId: number;
  storyId: number;
};

export const useShareStoryToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ShareStoryInput) => api.shareStoryWithGroup(input.groupId, input.storyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupStories', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['storyGroups', variables.storyId] });
    },
  });
};
