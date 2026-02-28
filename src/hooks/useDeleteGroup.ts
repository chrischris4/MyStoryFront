import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

const deleteGroup = async (
  groupId: number,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group/${groupId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression du groupe');
  }
};

export const useDeleteGroup = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: number) => deleteGroup(groupId, accessToken),
    onMutate: async (groupId) => {
      await queryClient.cancelQueries({ queryKey: ['groups'] });
      const previous = queryClient.getQueryData(['groups']);
      queryClient.setQueryData(['groups'], (old: any[]) =>
        old?.filter((g) => g.id !== groupId) ?? []
      );
      return { previous };
    },
    onError: (_err, _groupId, context) => {
      queryClient.setQueryData(['groups'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
