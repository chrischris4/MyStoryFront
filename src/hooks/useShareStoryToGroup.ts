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

  const response = await fetch(`${API_BASE_URL}/group/${input.groupId}/share-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ storyId: input.storyId }),
  });

  if (!response.ok) {
    throw new Error('Erreur lors du partage de l\'histoire');
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
