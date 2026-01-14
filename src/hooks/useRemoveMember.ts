import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';

type RemoveMemberInput = {
  groupId: number;
  memberId: number;
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RemoveMemberInput) => api.removeMember(input.groupId, input.memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
