export const initConnection = async () => true;
export const flushFailedPurchasesCachedAsPendingAndroid = async () => {};
export const getProducts = async ({ skus }: { skus: string[] }) =>
  skus.map((sku) => ({
    productId: sku,
    title: sku,
    description: 'Produit simulé pour dev',
    localizedPrice: '$0.99',
  }));
export const getSubscriptions = getProducts;
export const requestPurchase = async ({ sku }: { sku: string }) => console.log('Achat simulé', sku);
export const purchaseUpdatedListener = (cb: any) => ({ remove: () => {} });
export const purchaseErrorListener = (cb: any) => ({ remove: () => {} });
export const finishTransaction = async () => {};
export const endConnection = async () => {};
