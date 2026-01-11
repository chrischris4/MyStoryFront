import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';
import type { Group } from './useGroups';

type CreateGroupInput = {
  name: string;
  description?: string;
  imageUrl?: string;
};

const createGroup = async (
  input: CreateGroupInput,
  token: string | null
): Promise<Group> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création du groupe');
  }

  const data = await response.json();
  return data;
};

export const useCreateGroup = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGroupInput) => createGroup(input, accessToken),
    onSuccess: () => {
      // Invalider et refetch automatiquement la liste des groupes
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
