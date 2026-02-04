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
    onMutate: async (variables) => {
      // Annuler toutes les queries en cours pour éviter qu'elles écrasent notre mise à jour optimiste
      await queryClient.cancelQueries({ queryKey: ['checkFavorite', variables.storyId] });

      // Sauvegarder la valeur précédente pour pouvoir rollback en cas d'erreur
      const previousValue = queryClient.getQueryData<boolean>(['checkFavorite', variables.storyId]);

      // Mise à jour optimiste : inverser immédiatement la valeur dans le cache
      queryClient.setQueryData<boolean>(
        ['checkFavorite', variables.storyId],
        !variables.isFavorite
      );

      // Retourner un contexte avec la valeur précédente pour le rollback
      return { previousValue, storyId: variables.storyId };
    },
    onSuccess: (_data, variables) => {
      // Forcer la mise à jour du cache avec la nouvelle valeur
      queryClient.setQueryData<boolean>(
        ['checkFavorite', variables.storyId],
        !variables.isFavorite
      );

      // Invalider et refetch les queries liées aux favoris
      queryClient.invalidateQueries({ queryKey: ['checkFavorite', variables.storyId] });
      queryClient.invalidateQueries({ queryKey: ['favoriteStories'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
    onError: (error: Error, variables, context) => {
      console.error('Erreur lors du toggle favori:', error);

      // Rollback : restaurer la valeur précédente en cas d'erreur
      if (context?.previousValue !== undefined) {
        queryClient.setQueryData<boolean>(
          ['checkFavorite', context.storyId],
          context.previousValue
        );
      }

      // Si l'erreur est une contrainte unique (favori déjà existant),
      // forcer un refetch pour synchroniser avec le serveur
      if (error.message.includes('Unique constraint') || error.message.includes('P2002')) {
        queryClient.invalidateQueries({ queryKey: ['checkFavorite', variables.storyId] });
      }
    },
  });
};
