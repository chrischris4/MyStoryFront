import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';
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

const verifyAndPurchaseProduct = async (
  input: VerifyPurchaseInput,
  token: string | null
): Promise<VerifyPurchaseResponse> => {
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const packageName = Platform.OS === 'android' ? 'com.flun.app' : undefined;

  const response = await fetch(`${API_BASE_URL}/products/verify-purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      platform,
      productId: input.productId,
      receipt: input.receipt,
      purchaseToken: input.purchaseToken,
      packageName,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la validation de l'achat");
  }

  return response.json();
};

export const usePurchaseProduct = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyPurchaseInput) => verifyAndPurchaseProduct(input, accessToken),
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
