import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type InviteToGroupInput = {
  groupId: number;
  userId?: number;
  email?: string;
  name?: string;
};

const inviteToGroup = async (
  input: InviteToGroupInput,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  console.log('🔵 Invitation request:', {
    url: `${API_BASE_URL}/group/${input.groupId}/invite`,
    body: { userId: input.userId, email: input.email, name: input.name },
  });

  const response = await fetch(`${API_BASE_URL}/group/${input.groupId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId: input.userId,
      email: input.email,
      name: input.name,
    }),
  });

  console.log('🔵 Invitation response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log('🔴 Invitation error:', errorData);
    throw new Error(errorData.message || 'Erreur lors de l\'envoi de l\'invitation');
  }

  const data = await response.json().catch(() => ({}));
  console.log('🟢 Invitation success:', data);
};

export const useInviteToGroup = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteToGroupInput) => inviteToGroup(input, accessToken),
    onSuccess: () => {
      // Invalider les invitations envoyées (si on a une query pour ça)
      queryClient.invalidateQueries({ queryKey: ['sentInvitations'] });
    },
  });
};
