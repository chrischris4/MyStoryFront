import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type Product = {
  id: number;
  name: string;
  description: string | null;
  storyCoins: number;
  price: number;
  currency: string;
  appleProductId: string | null;
  googleProductId: string | null;
  isActive: boolean;
};

const fetchProducts = async (token: string | null): Promise<Product[]> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des produits');
  }

  return response.json();
};

export const useProducts = () => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(accessToken),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // Cache 5 minutes
  });
};
