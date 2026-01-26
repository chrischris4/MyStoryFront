import { useMutation } from '@tanstack/react-query';
import { api } from '~/services/api';

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: () => api.deleteUser(),
  });
};
