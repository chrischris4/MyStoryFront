import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: number) => api.deleteStory(storyId),
    onSuccess: () => {
      // Invalider toutes les queries liées aux stories
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['favoriteStories'] });
      queryClient.invalidateQueries({ queryKey: ['groupStories'] });
    },
  });
};
