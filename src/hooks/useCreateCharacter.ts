import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';
import type { Character, CreateCharacterInput } from '~/types';

export const useCreateCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCharacterInput): Promise<Character> =>
      api.createCharacter(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
};
