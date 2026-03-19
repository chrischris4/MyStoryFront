import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { api } from '~/services/api';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VerifyPurchaseInput = {
  productId: string;
  transactionId: string;
  receipt?: string; // iOS
  purchaseToken?: string; // Android
};

type VerifyPurchaseResponse = {
  success: boolean;
  coinsAdded: number;
};

export const usePurchaseProduct = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyPurchaseInput) => {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const packageName = Platform.OS === 'android' ? 'com.flun.app' : undefined;
      return api.post<VerifyPurchaseResponse>('/product/purchase', {
        platform,
        productId: input.productId,
        receipt: input.receipt,
        purchaseToken: input.purchaseToken,
        packageName,
      });
    },
    onSuccess: (data) => {
      if (user) {
        const updatedUser = { ...user, storyCoin: (user.storyCoin ?? 0) + data.coinsAdded };
        setUser(updatedUser);
        AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
