import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type ToggleFavoriteParams = {
  storyId: number;
  isFavorite: boolean;
};

const toggleFavorite = async (
  params: ToggleFavoriteParams,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Utilisateur non connecté');
  }

  const method = params.isFavorite ? 'DELETE' : 'POST';

  const response = await fetch(`${API_BASE_URL}/favorite-story`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ storyId: params.storyId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erreur lors de la modification du favori');
  }
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ToggleFavoriteParams) => {
      // Récupérer le token frais à chaque mutation
      const accessToken = useUserStore.getState().accessToken;
      return toggleFavorite(params, accessToken);
    },
    onSuccess: () => {
      // Invalider et refetch les queries liées aux favoris
      queryClient.invalidateQueries({ queryKey: ['favoriteStories'] });
      queryClient.invalidateQueries({ queryKey: ['checkFavorite'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
    onError: (error: Error) => {
      console.error('Erreur lors du toggle favori:', error);
    },
  });
};
