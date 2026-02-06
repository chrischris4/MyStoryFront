import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type CreateStoryInput = {
  prompt: string;
  numberOfPages: number;
  title: string;
  style: string;
  language: string;
  characterIds?: number[];
  characterDescriptions?: string[];
};

type CreateStoryResponse = {
  storyId: number;
  status: string;
};

const createStory = async (
  input: CreateStoryInput,
  token: string | null
): Promise<CreateStoryResponse> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/story/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('❌ Réponse serveur:', response.status, errorData);
    throw new Error(errorData?.message || 'Erreur lors de la création de l\'histoire');
  }

  const data = await response.json();
  return data;
};

export const useCreateStory = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStoryInput) => createStory(input, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
};
