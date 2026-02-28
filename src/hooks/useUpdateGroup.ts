import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type UpdateGroupInput = {
  groupId: number;
  name?: string;
  description?: string;
};

const updateGroup = async (input: UpdateGroupInput, token: string | null) => {
  if (!token) throw new Error('Utilisateur non authentifié');

  const { groupId, ...dto } = input;
  const response = await fetch(`${API_BASE_URL}/group/${groupId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) throw new Error('Erreur lors de la mise à jour du groupe');

  return response.json();
};

export const useUpdateGroup = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateGroupInput) => updateGroup(input, accessToken),
    onMutate: async ({ groupId, name, description }) => {
      await queryClient.cancelQueries({ queryKey: ['groups'] });
      const previous = queryClient.getQueryData(['groups']);
      queryClient.setQueryData(['groups'], (old: any[]) =>
        old?.map((g) =>
          g.id === groupId
            ? { ...g, ...(name !== undefined && { name }), ...(description !== undefined && { description }) }
            : g
        ) ?? []
      );
      return { previous };
    },
    onError: (_err, _input, context) => {
      queryClient.setQueryData(['groups'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
