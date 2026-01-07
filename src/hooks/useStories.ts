import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type Story = {
  id: string;
  title: string;
  prompt: string;
  style: string;
  numberOfPages: number;
  createdAt: string;
  pages: {
    page: number;
    text: string;
    imageUrl: string;
  }[];
};

const fetchStories = async (token: string | null): Promise<Story[]> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/story`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des histoires');
  }

  const data = await response.json();
  return data;
};

export const useStories = () => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['stories'],
    queryFn: () => fetchStories(accessToken),
    staleTime: 1000 * 60 * 5, // Les données sont considérées comme fraîches pendant 5 minutes
    retry: 2, // Réessayer 2 fois en cas d'erreur
    enabled: !!accessToken, // Ne lance la requête que si on a un token
  });
};
