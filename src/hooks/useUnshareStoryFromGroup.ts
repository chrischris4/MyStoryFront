import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';

type UnshareStoryInput = {
  groupId: number;
  storyId: number;
};

export const useUnshareStoryFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UnshareStoryInput) => api.unshareStoryFromGroup(input.groupId, input.storyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupStories', variables.groupId] });
      queryClient.invalidateQueries({
        queryKey: ['storyGroups', variables.storyId],
        refetchType: 'all',
      });
    },
  });
};
