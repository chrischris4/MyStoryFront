import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

export type Group = {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  ownerId: number;
  createdAt: string;
  _count?: {
    members: number;
    stories: number;
  };
};

const fetchGroups = async (token: string | null): Promise<Group[]> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/group`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des groupes');
  }

  const data = await response.json();
  return data;
};

export const useGroups = () => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['groups'],
    queryFn: () => fetchGroups(accessToken),
    staleTime: 1000 * 60 * 5, // Les données sont considérées comme fraîches pendant 5 minutes
    retry: 2,
    enabled: !!accessToken,
  });
};
