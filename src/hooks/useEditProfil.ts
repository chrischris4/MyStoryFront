import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type EditProfilInput = {
  name?: string;
  imageUri?: string; // URI locale de l'image (depuis ImagePicker)
};

type Profil = {
  id: number;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

const editProfil = async (
  input: EditProfilInput,
  token: string | null
): Promise<Profil> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const formData = new FormData();

  if (input.name) {
    formData.append('name', input.name);
  }

  if (input.imageUri) {
    const filename = input.imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: input.imageUri,
      name: filename,
      type,
    } as any);
  }

  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      // Pas de Content-Type, fetch le définit automatiquement avec boundary pour FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('EditProfil - Error response:', errorText);

    let errorMessage = 'Erreur lors de la modification du profil';
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
      console.error('EditProfil - Error data:', errorData);
    } catch (e) {
      console.error('EditProfil - Could not parse error as JSON');
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};

export const useEditProfil = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EditProfilInput) => editProfil(input, accessToken),
    onSuccess: () => {
      // Invalider et refetch automatiquement les données utilisateur
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
