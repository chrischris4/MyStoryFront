import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type SubscriptionPlan = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration: number; // en jours
  features: string[];
  appleProductId: string | null;
  googleProductId: string | null;
  isActive: boolean;
};

const fetchSubscriptionPlans = async (token: string | null): Promise<SubscriptionPlan[]> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/subscriptions/plans`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des plans');
  }

  return response.json();
};

export const useSubscriptionPlans = () => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => fetchSubscriptionPlans(accessToken),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // Cache 5 minutes
  });
};
