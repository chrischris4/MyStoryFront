import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

const leaveGroup = async (
  groupId: number,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group/${groupId}/leave`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la sortie du groupe');
  }
};

export const useLeaveGroup = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: number) => leaveGroup(groupId, accessToken),
    onSuccess: () => {
      // Invalider les groupes pour retirer le groupe quitté
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
