import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Dimensions, FlatList, GestureResponderEvent } from 'react-native';
import BottomNavBar from '~/navigation/BottomNavBar';
import ShopButton from '~/components/ShopButton';
import { useTheme } from '~/context/ThemeContext';


export default function BillingScreen() {
    // === GESTION DU MODULE IAP ===
    let RNIap;
    if (__DEV__) {
        RNIap = {
            initConnection: async () => true,
            flushFailedPurchasesCachedAsPendingAndroid: async () => { },
            getProducts: async ({ skus }: { skus: string[] }) =>
                skus.map((sku) => ({
                    productId: sku,
                    title: sku,
                    description: 'Produit simulé pour dev',
                    localizedPrice: '$0.99',
                })),
            getSubscriptions: async ({ skus }: { skus: string[] }) =>
                skus.map((sku) => ({
                    productId: sku,
                    title: sku,
                    description: 'Abonnement simulé pour dev',
                    localizedPrice: '$1.99',
                })),
            requestPurchase: async ({ sku }: { sku: string }) => console.log('Achat simulé', sku),
            purchaseUpdatedListener: (cb: any) => ({ remove: () => { } }),
            purchaseErrorListener: (cb: any) => ({ remove: () => { } }),
            finishTransaction: async () => { },
            endConnection: async () => { },
        };
    } else {
        RNIap = require('react-native-iap');
    }

    // === PRODUITS ===
    const itemSkus = ['tokens_pack_100', 'premium_monthly'];

    const [products, setProducts] = useState<RNIap.Product[]>([]);
    const { isNight } = useTheme();

    useEffect(() => {
        const initIAP = async () => {
            try {
                await RNIap.initConnection();
                await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
                const items = await RNIap.getProducts({ skus: itemSkus });
                const subs = await RNIap.getSubscriptions({ skus: itemSkus });
                setProducts([...items, ...subs]);
            } catch (err) {
                console.warn('Erreur IAP init:', err);
            }
        };

        initIAP();

        const purchaseUpdate = RNIap.purchaseUpdatedListener(async (purchase: RNIap.Purchase) => {
            const receipt = purchase.transactionReceipt;
            if (receipt) {
                Alert.alert(
                    purchase.productId === 'tokens_pack_100' ? '✅ Jetons achetés' : '🎉 Abonnement activé',
                    purchase.productId === 'tokens_pack_100'
                        ? 'Tu as reçu 100 jetons 🎉'
                        : 'Bienvenue Premium !'
                );
                await RNIap.finishTransaction({ purchase, isConsumable: true });
            }
        });

        const purchaseError = RNIap.purchaseErrorListener((error: any) => {
            console.warn('Erreur d’achat', error);
            Alert.alert('Erreur', error.message);
        });

        return () => {
            purchaseUpdate.remove();
            purchaseError.remove();
            RNIap.endConnection();
        };
    }, []);

    const buy = async (sku: string) => {
        try {
            await RNIap.requestPurchase({ sku });
        } catch (err) {
            console.warn('Erreur achat', err);
        }
    };

    const skyColor = isNight ? '#020205' : '#87CEEB';
    const cloudColor = isNight ? '#A0AEC0' : '#FFFFFF';
    const groundColor = isNight ? '#2E313F' : '#38A169';
    const groundBorderColor = isNight ? '#44495D' : '#2F855A';

    const renderStars = (count: number) => {
        const stars = [];
        const { width, height } = Dimensions.get('window');

        for (let i = 0; i < count; i++) {
            const size = Math.random() * 2 + 1; // taille entre 1 et 3
            const top = Math.random() * (height * 0.5); // moitié supérieure de l'écran
            const left = Math.random() * width;
            const opacity = Math.random() * 0.8 + 0.2; // variation d'opacité

            stars.push(
                <View
                    key={`star-${i}`}
                    style={{
                        position: 'absolute',
                        top,
                        left,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: '#FFFFFF',
                        opacity,
                    }}
                />
            );
        }

        return stars;
    };

    return (
        <View className="flex-1 pt-4 px-4 relative" style={{ backgroundColor: isNight ? '#020205' : '#87CEEB' }}>
            {isNight && renderStars(50)}
            <View
                className='absolute bottom-0 -right-40 border-4 h-36 rounded-t-full w-[100%] z-0'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
            />
            <View
                className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-10'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
            />
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 20 }}>🛒 Boutique</Text>
            <View className="flex-col mb-4">
                <Text className="text-xl font-bold mb-2">Achat de jetons</Text>
                <Text className="text-sm mb-4">1 jeton vous permet de créer une histoire</Text>
                <View className='flex-row gap-4'>
                    <ShopButton title="Pack 10 jetons" price="$9.99" onPress={() => buy('tokens_pack_100')} />
                    <ShopButton title="Pack 20 jetons" price="$18.99" onPress={() => buy('tokens_pack_500')} />
                </View>
            </View>

            <View className="flex-1 mb-4">
                <Text className="text-xl font-bold mb-2">Abonnement</Text>
                <Text className="text-sm mb-4">
                    Devenez membre Flun pour avoir accès aux histoires partagées par les utilisateurs et bénéficier de 10 jetons par mois
                </Text>
                <View className='flex-row gap-4'>
                    <ShopButton title="Premium Mensuel" price="$14.99" onPress={() => buy('premium_monthly')} />
                    <ShopButton title="Premium Annuel" price="$149.99" onPress={() => buy('premium_yearly')} />
                </View>
            </View>


            <BottomNavBar />
        </View>
    );
};
