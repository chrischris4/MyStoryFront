import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

const joinGroup = async (
  groupId: number,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group/${groupId}/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la demande d\'adhésion au groupe');
  }
};

export const useJoinGroup = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: number) => joinGroup(groupId, accessToken),
    onSuccess: () => {
      // Invalider les groupes pour afficher le nouveau groupe
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
