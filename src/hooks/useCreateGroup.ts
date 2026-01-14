import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';

type CreateGroupInput = {
  name: string;
  description?: string;
  imageUrl?: string;
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGroupInput) => api.createGroup(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
