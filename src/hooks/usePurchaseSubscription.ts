import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { useUserStore, SubscriptionPlan } from '~/store/useUserStore';
import { api } from '~/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VerifySubscriptionInput = {
  productId: string;
  planId: number;
  planName: SubscriptionPlan;
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

export const usePurchaseSubscription = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifySubscriptionInput) => {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const packageName = Platform.OS === 'android' ? 'com.flun.app' : undefined;
      return api.post<Subscription>('/subscription/verify-purchase', {
        platform,
        productId: input.productId,
        planId: input.planId,
        receipt: input.receipt,
        purchaseToken: input.purchaseToken,
        packageName,
      });
    },
    onSuccess: (_, input) => {
      if (user) {
        const updatedUser = { ...user, subscriptionPlan: input.planName };
        setUser(updatedUser);
        AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
