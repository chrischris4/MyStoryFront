import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// Types pour react-native-iap
type Product = {
  productId: string;
  title: string;
  description: string;
  price: string;
  localizedPrice: string;
  currency: string;
};

type Purchase = {
  productId: string;
  transactionId: string;
  transactionReceipt: string;
  purchaseToken?: string; // Android
};

type PurchaseError = {
  code: string;
  message: string;
};

// Mock pour le dev
const createDevMock = () => ({
  initConnection: async () => true,
  flushFailedPurchasesCachedAsPendingAndroid: async () => {},
  getProducts: async ({ skus }: { skus: string[] }) =>
    skus.map((sku) => ({
      productId: sku,
      title: sku,
      description: 'Produit simulé',
      price: '0.99',
      localizedPrice: '$0.99',
      currency: 'USD',
    })),
  getSubscriptions: async ({ skus }: { skus: string[] }) =>
    skus.map((sku) => ({
      productId: sku,
      title: sku,
      description: 'Abonnement simulé',
      price: '1.99',
      localizedPrice: '$1.99',
      currency: 'USD',
    })),
  requestPurchase: async ({ sku }: { sku: string }) => {
    console.log('[DEV] Achat simulé:', sku);
    return {
      productId: sku,
      transactionId: `dev_${Date.now()}`,
      transactionReceipt: 'dev_receipt_mock',
      purchaseToken: 'dev_token_mock',
    };
  },
  purchaseUpdatedListener: (cb: (purchase: Purchase) => void) => {
    // Simuler un achat réussi après 1s en dev
    return { remove: () => {} };
  },
  purchaseErrorListener: (cb: (error: PurchaseError) => void) => ({ remove: () => {} }),
  finishTransaction: async () => {},
  endConnection: async () => {},
});

export function useIAP() {
  const [isReady, setIsReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const purchaseUpdateListener = useRef<{ remove: () => void } | null>(null);
  const purchaseErrorListener = useRef<{ remove: () => void } | null>(null);
  const onPurchaseSuccessRef = useRef<((purchase: Purchase) => void) | null>(null);
  const onPurchaseErrorRef = useRef<((error: PurchaseError) => void) | null>(null);

  // Récupérer le module IAP (mock en dev)
  const getRNIap = () => {
    if (__DEV__) {
      return createDevMock();
    }
    return require('react-native-iap');
  };

  // SKUs des produits
  const productSkus = ['tokens_pack_5', 'tokens_pack_10', 'tokens_pack_20'];
  const subscriptionSkus = [
    'explorer_monthly',
    'explorer_yearly',
    'adventurer_monthly',
    'adventurer_yearly',
    'legend_monthly',
    'legend_yearly',
  ];

  useEffect(() => {
    const initIAP = async () => {
      const RNIap = getRNIap();

      try {
        setIsLoading(true);
        await RNIap.initConnection();

        if (Platform.OS === 'android') {
          await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        }

        // Récupérer les produits
        const [fetchedProducts, fetchedSubs] = await Promise.all([
          RNIap.getProducts({ skus: productSkus }),
          RNIap.getSubscriptions({ skus: subscriptionSkus }),
        ]);

        setProducts(fetchedProducts);
        setSubscriptions(fetchedSubs);
        setIsReady(true);

        // Listeners pour les achats
        purchaseUpdateListener.current = RNIap.purchaseUpdatedListener(
          async (purchase: Purchase) => {
            if (purchase.transactionReceipt) {
              onPurchaseSuccessRef.current?.(purchase);
              await RNIap.finishTransaction({ purchase, isConsumable: true });
            }
          }
        );

        purchaseErrorListener.current = RNIap.purchaseErrorListener((err: PurchaseError) => {
          onPurchaseErrorRef.current?.(err);
        });
      } catch (err: any) {
        console.error('Erreur init IAP:', err);
        setError(err.message || 'Erreur initialisation IAP');
      } finally {
        setIsLoading(false);
      }
    };

    initIAP();

    return () => {
      purchaseUpdateListener.current?.remove();
      purchaseErrorListener.current?.remove();
      getRNIap().endConnection();
    };
  }, []);

  const requestPurchase = async (sku: string): Promise<Purchase | null> => {
    const RNIap = getRNIap();

    try {
      const purchase = await RNIap.requestPurchase({ sku });
      return purchase;
    } catch (err: any) {
      console.error('Erreur achat:', err);
      throw err;
    }
  };

  const setOnPurchaseSuccess = (callback: (purchase: Purchase) => void) => {
    onPurchaseSuccessRef.current = callback;
  };

  const setOnPurchaseError = (callback: (error: PurchaseError) => void) => {
    onPurchaseErrorRef.current = callback;
  };

  return {
    isReady,
    isLoading,
    error,
    products,
    subscriptions,
    requestPurchase,
    setOnPurchaseSuccess,
    setOnPurchaseError,
  };
}
