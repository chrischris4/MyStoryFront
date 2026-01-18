import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

const acceptInvitation = async (
  invitationId: number,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  console.log('🔵 Accept invitation request:', {
    url: `${API_BASE_URL}/group/invitation/${invitationId}/accept`,
    invitationId,
  });

  const response = await fetch(`${API_BASE_URL}/group/invitation/${invitationId}/accept`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('🔵 Accept invitation response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log('🔴 Accept invitation error:', errorData);
    throw new Error(errorData.message || 'Erreur lors de l\'acceptation de l\'invitation');
  }

  const data = await response.json().catch(() => ({}));
  console.log('🟢 Accept invitation success:', data);
};

export const useAcceptInvitation = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => acceptInvitation(invitationId, accessToken),
    onSuccess: () => {
      // Invalider les invitations et les groupes
      queryClient.invalidateQueries({ queryKey: ['groupInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
