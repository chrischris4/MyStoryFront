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
  console.log('🔑 fetchGroups - Token:', token ? `${token.substring(0, 20)}...` : 'NULL');

  if (!token) {
    console.error('❌ fetchGroups - Pas de token');
    throw new Error('Utilisateur non authentifié');
  }

  console.log('📡 fetchGroups - Appel API:', `${API_BASE_URL}/group`);

  const response = await fetch(`${API_BASE_URL}/group`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('📥 fetchGroups - Status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('❌ fetchGroups - Error response:', errorData);
    throw new Error(errorData?.message || 'Erreur lors de la récupération des groupes');
  }

  const data = await response.json();
  console.log('✅ fetchGroups - Groupes reçus:', data.length);
  return data;
};

export const useGroups = () => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['groups', accessToken],
    queryFn: () => {
      const currentToken = useUserStore.getState().accessToken;
      return fetchGroups(currentToken);
    },
    staleTime: 1000 * 60 * 5, // Les données sont considérées comme fraîches pendant 5 minutes
    retry: 2,
    enabled: !!accessToken,
  });
};
