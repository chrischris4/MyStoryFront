import { useQuery } from '@tanstack/react-query';
import { api } from '~/services/api';
import type { Character } from '~/types';

const fetchCharacters = async (): Promise<Character[]> => {
  const data = await api.getCharacters();
  return data;
};

export const useCharacters = () => {
  return useQuery({
    queryKey: ['characters'],
    queryFn: fetchCharacters,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
