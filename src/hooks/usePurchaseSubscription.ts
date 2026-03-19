import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { useUserStore, SubscriptionPlan } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VerifySubscriptionInput = {
  productId: string;
  planId: number; // ID du plan dans ta BDD
  planName: SubscriptionPlan; // Nom du plan pour mettre à jour le Zustand store
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
  const packageName = Platform.OS === 'android' ? 'com.flun.app' : undefined;

  const response = await fetch(`${API_BASE_URL}/subscription/verify-purchase`, {
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
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifySubscriptionInput) => verifyAndCreateSubscription(input, accessToken),
    onSuccess: (_, input) => {
      if (user) {
        const updatedUser = { ...user, subscriptionPlan: input.planName };
        setUser(updatedUser);
        AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};
