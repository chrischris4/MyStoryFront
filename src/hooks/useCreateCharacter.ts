import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';
import type { Character, CreateCharacterInput } from '~/types';

export const useCreateCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCharacterInput): Promise<Character> =>
      api.createCharacter(input),
    onSuccess: (newCharacter) => {
      queryClient.setQueryData<Character[]>(['characters'], (old) =>
        old ? [...old, newCharacter] : [newCharacter]
      );
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
};
