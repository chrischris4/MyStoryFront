import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';

export const useDeleteCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteCharacter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
};
