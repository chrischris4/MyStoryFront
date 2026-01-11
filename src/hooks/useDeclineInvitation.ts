import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

const declineInvitation = async (
  invitationId: number,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group/invitation/${invitationId}/decline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors du refus de l\'invitation');
  }
};

export const useDeclineInvitation = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => declineInvitation(invitationId, accessToken),
    onSuccess: () => {
      // Invalider les invitations
      queryClient.invalidateQueries({ queryKey: ['groupInvitations'] });
    },
  });
};
