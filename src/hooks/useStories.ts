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
  status?: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  failureReason?: string;
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
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!accessToken,
    // Auto-refetch toutes les 5s si des stories sont en cours de génération
    refetchInterval: (query) => {
      const stories = query.state.data;
      const hasPending = stories?.some(
        (s) => s.status === 'PENDING' || s.status === 'GENERATING'
      );
      return hasPending ? 5000 : false;
    },
  });
};
