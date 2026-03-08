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
      const accessToken = useUserStore.getState().accessToken;
      return toggleFavorite(params, accessToken);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['favoriteStories'] });

      const previousFavorites = queryClient.getQueryData<any[]>(['favoriteStories']) ?? [];

      if (variables.isFavorite) {
        // Retirer des favoris
        queryClient.setQueryData<any[]>(
          ['favoriteStories'],
          previousFavorites.filter((s: any) => s.id !== variables.storyId)
        );
      } else {
        // Ajouter aux favoris : chercher dans tous les caches disponibles
        const allCached = [
          ...(queryClient.getQueryData<any[]>(['stories']) ?? []),
          ...(queryClient.getQueryData<any[]>(['communityStories']) ?? []),
          ...previousFavorites,
        ];
        const story = allCached.find((s: any) => s.id === variables.storyId)
          ?? { id: variables.storyId }; // fallback minimal pour que isFavorite soit true

        queryClient.setQueryData<any[]>(
          ['favoriteStories'],
          [story, ...previousFavorites]
        );
      }

      return { previousFavorites };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteStories'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['communityStories'] });
    },
    onError: (error: Error, _variables, context) => {
      console.error('Erreur lors du toggle favori:', error);

      // Rollback favoriteStories
      if (context?.previousFavorites !== undefined) {
        queryClient.setQueryData<any[]>(
          ['favoriteStories'],
          context.previousFavorites
        );
      }
    },
  });
};
