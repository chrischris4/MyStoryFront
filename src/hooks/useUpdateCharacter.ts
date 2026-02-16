import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';
import type { Character, UpdateCharacterInput } from '~/types';

type UpdateCharacterParams = {
  id: number;
  data: UpdateCharacterInput;
};

export const useUpdateCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCharacterParams): Promise<Character> =>
      api.updateCharacter(id, data),
    onSuccess: (updatedCharacter) => {
      queryClient.setQueryData<Character[]>(['characters'], (old) =>
        old ? old.map((c) => (c.id === updatedCharacter.id ? updatedCharacter : c)) : []
      );
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
};
