import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { api } from '~/services/api';

type SubscriptionPlan = {
  id: number;
  name: string;
  type: string;
  price: number;
};

type Subscription = {
  id: number;
  plan: SubscriptionPlan;
};

type Product = {
  id: number;
  name: string;
  price: number;
  coins: number;
};

export type Transaction = {
  id: number;
  userId: number;
  productId: number | null;
  subscriptionId: number | null;
  transactionId: string;
  platform: string;
  amount: number;
  currency: string;
  status: string;
  purchaseDate: string;
  subscription: Subscription | null;
  product: Product | null;
};

export const useTransactionsByUser = (enabled: boolean = true) => {
  const accessToken = useUserStore((state) => state.accessToken);

  return useQuery<Transaction[]>({
    queryKey: ['userTransactions'],
    queryFn: () => api.getUserTransactions(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: enabled && !!accessToken,
  });
};
