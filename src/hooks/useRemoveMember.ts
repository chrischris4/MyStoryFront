import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type RemoveMemberInput = {
  groupId: number;
  memberId: number;
};

const removeMember = async (
  input: RemoveMemberInput,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group/${input.groupId}/member/${input.memberId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'exclusion du membre');
  }
};

export const useRemoveMember = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RemoveMemberInput) => removeMember(input, accessToken),
    onSuccess: (_, variables) => {
      // Invalider les membres du groupe
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
