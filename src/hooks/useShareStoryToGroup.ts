import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type ShareStoryInput = {
  groupId: number;
  storyId: number;
};

const shareStory = async (
  input: ShareStoryInput,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group/${input.groupId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ storyId: input.storyId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || `Erreur ${response.status}: ${response.statusText}`;
    console.error('Erreur API partage:', errorMessage, errorData);
    throw new Error(errorMessage);
  }
};

export const useShareStoryToGroup = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ShareStoryInput) => shareStory(input, accessToken),
    onSuccess: (_, variables) => {
      // Invalider les histoires du groupe
      queryClient.invalidateQueries({ queryKey: ['groupStories', variables.groupId] });
    },
  });
};
