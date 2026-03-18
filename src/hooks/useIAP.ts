import { useState, useEffect, useRef } from 'react';

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
  purchaseToken?: string;
};

type PurchaseError = {
  code: string;
  message: string;
};

const productSkus = ['tokens_5', 'tokens_10', 'tokens_20'];
const subscriptionSkus = [
  'explorer_monthly',
  'explorer_yearly',
  'adventurer_monthly',
  'adventurer_yearly',
  'legend_monthly',
  'legend_yearly',
];

const normalizePrice = (item: any): string =>
  item.localizedPrice
  ?? item.oneTimePurchaseOfferDetails?.formattedPrice
  ?? item.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList?.[0]?.formattedPrice
  ?? '...';

export function useIAP() {
  const [isReady, setIsReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log('[IAP]', msg);
    setDebugLogs((prev) => [...prev, `${new Date().toISOString().slice(11, 19)} ${msg}`]);
  };

  const purchaseUpdateListener = useRef<{ remove: () => void } | null>(null);
  const purchaseErrorListener = useRef<{ remove: () => void } | null>(null);
  const onPurchaseSuccessRef = useRef<((purchase: Purchase) => void) | null>(null);
  const onPurchaseErrorRef = useRef<((error: PurchaseError) => void) | null>(null);

  useEffect(() => {
    const initIAP = async () => {
      try {
        setIsLoading(true);

        if (__DEV__) {
          // Mock en dev
          setProducts(productSkus.map((sku) => ({ productId: sku, title: sku, description: '', price: '0.99', localizedPrice: '0,99 €', currency: 'EUR' })));
          setSubscriptions(subscriptionSkus.map((sku) => ({ productId: sku, title: sku, description: '', price: '1.99', localizedPrice: '1,99 €', currency: 'EUR' })));
          setIsReady(true);
          return;
        }

        const iapModule = require('react-native-iap');
        const iap = iapModule.default || iapModule;

        const { initConnection, fetchProducts, purchaseUpdatedListener, purchaseErrorListener: purchaseErrListener, finishTransaction } = iap;

        const connected = await initConnection();
        addLog(`initConnection: ${JSON.stringify(connected)}`);

        addLog('calling fetchProducts...');
        const fetchedProducts = await fetchProducts({ skus: productSkus, type: 'in-app' });
        addLog(`calling fetchProducts subs...`);
        const fetchedSubs = await fetchProducts({ skus: subscriptionSkus, type: 'subs' });

        addLog(`products (${fetchedProducts.length}): ${fetchedProducts.map((p: any) => p.id || p.productId).join(', ') || 'none'}`);
        addLog(`subs (${fetchedSubs.length}): ${fetchedSubs.map((s: any) => s.id || s.productId).join(', ') || 'none'}`);

        setProducts(fetchedProducts.map((p: any) => ({
          ...p,
          productId: p.id || p.productId || p.sku,
          localizedPrice: p.displayPrice || normalizePrice(p),
        })));
        setSubscriptions(fetchedSubs.map((s: any) => ({
          ...s,
          productId: s.id || s.productId || s.sku,
          localizedPrice: s.displayPrice || normalizePrice(s),
        })));
        setIsReady(true);

        purchaseUpdateListener.current = purchaseUpdatedListener(async (purchase: Purchase) => {
          if (purchase.transactionReceipt) {
            onPurchaseSuccessRef.current?.(purchase);
            await finishTransaction({ purchase, isConsumable: true });
          }
        });

        purchaseErrorListener.current = purchaseErrListener((err: PurchaseError) => {
          onPurchaseErrorRef.current?.(err);
        });
      } catch (err: any) {
        addLog(`ERROR: ${err?.message || JSON.stringify(err)}`);
        setError(err.message || 'Erreur initialisation IAP');
      } finally {
        setIsLoading(false);
      }
    };

    initIAP();

    return () => {
      purchaseUpdateListener.current?.remove();
      purchaseErrorListener.current?.remove();
      if (!__DEV__) {
        const { endConnection } = require('react-native-iap');
        endConnection();
      }
    };
  }, []);

  const requestPurchase = async (sku: string): Promise<Purchase | null> => {
    if (__DEV__) {
      return { productId: sku, transactionId: `dev_${Date.now()}`, transactionReceipt: 'dev_receipt', purchaseToken: 'dev_token' };
    }
    const { requestPurchase: rnRequestPurchase } = require('react-native-iap');
    const isSubscription = subscriptionSkus.includes(sku);
    try {
      return await rnRequestPurchase({
        request: { google: { skus: [sku] } },
        type: isSubscription ? 'subs' : 'in-app',
      });
    } catch (err: any) {
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
    debugLogs,
    requestPurchase,
    setOnPurchaseSuccess,
    setOnPurchaseError,
  };
}
