import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';
import type { Character } from '~/types';

export const useDeleteCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteCharacter(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['characters'] });
      const previous = queryClient.getQueryData<Character[]>(['characters']);
      queryClient.setQueryData<Character[]>(['characters'], (old) =>
        old ? old.filter((c) => c.id !== id) : []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['characters'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
};
