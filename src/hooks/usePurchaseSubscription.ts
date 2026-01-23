import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

type VerifySubscriptionInput = {
  productId: string;
  planId: number; // ID du plan dans ta BDD
  transactionId: string;
  receipt?: string; // iOS
  purchaseToken?: string; // Android
};

type Subscription = {
  id: number;
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const verifyAndCreateSubscription = async (
  input: VerifySubscriptionInput,
  token: string | null
): Promise<Subscription> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const packageName = Platform.OS === 'android' ? 'com.yourapp.package' : undefined; // TODO: Remplacer

  const response = await fetch(`${API_BASE_URL}/subscriptions/verify-purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      platform,
      productId: input.productId,
      planId: input.planId,
      receipt: input.receipt,
      purchaseToken: input.purchaseToken,
      packageName,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la validation de l'abonnement");
  }

  return response.json();
};

export const usePurchaseSubscription = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifySubscriptionInput) => verifyAndCreateSubscription(input, accessToken),
    onSuccess: () => {
      // Rafraîchir les données utilisateur (pour mettre à jour le plan)
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};
