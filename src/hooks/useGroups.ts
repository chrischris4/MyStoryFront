import { useQuery } from '@tanstack/react-query';
import { api } from '~/services/api';

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const data = await api.getMyGroups();
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: true, // ApiService gère le token
  });
};