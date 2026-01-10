import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Animated } from 'react-native';
import ShopButton from '~/components/ShopButton';
import SubscriptionModal from '~/components/SubscriptionModal';
import { useTheme } from '~/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/types';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import { BlurView } from 'expo-blur';

type StoryDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BillingScreen() {
    const navigation = useNavigation<StoryDetailNavigationProp>();

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
    const itemSkus = ['tokens_pack_5', 'tokens_pack_10', 'tokens_pack_20', 'premium_monthly', 'premium_yearly'];

    const [products, setProducts] = useState<RNIap.Product[]>([]);
    const { isNight } = useTheme();

    // États pour la modal d'abonnement
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{
        name: string;
        features: string[];
        monthlyPrice: string;
        yearlyPrice: string;
        monthlyProductId: string;
        yearlyProductId: string;
    } | null>(null);

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
                const isTokenPack = purchase.productId.includes('tokens_pack');
                Toast.show({
                    type: 'success',
                    text1: isTokenPack ? 'Jetons achetés' : 'Abonnement activé',
                    text2: isTokenPack ? 'Tu as reçu tes jetons !' : 'Bienvenue Premium !',
                });
                await RNIap.finishTransaction({ purchase, isConsumable: true });
            }
        });

        const purchaseError = RNIap.purchaseErrorListener((error: any) => {
            console.warn('Erreur d\'achat', error);
            Toast.show({
                type: 'error',
                text1: 'Erreur d\'achat',
                text2: error.message,
            });
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

    const openSubscriptionModal = (planType: 'explorer' | 'adventurer' | 'legend') => {
        const plans = {
            explorer: {
                name: 'Explorateur',
                features: ['Accès aux histoires partagées', 'Annuler à tout moment'],
                monthlyPrice: '$4.99/mois',
                yearlyPrice: '$49.99/an',
                monthlyProductId: 'explorer_monthly',
                yearlyProductId: 'explorer_yearly',
            },
            adventurer: {
                name: 'Aventurier',
                features: ['Accès aux histoires partagées', '1 jeton par jour', 'Annuler à tout moment'],
                monthlyPrice: '$14.99/mois',
                yearlyPrice: '$149.99/an',
                monthlyProductId: 'adventurer_monthly',
                yearlyProductId: 'adventurer_yearly',
            },
            legend: {
                name: 'Légende',
                features: ['Accès aux histoires partagées', '2 jetons par jour', 'Annuler à tout moment'],
                monthlyPrice: '$19.99/mois',
                yearlyPrice: '$199.99/an',
                monthlyProductId: 'legend_monthly',
                yearlyProductId: 'legend_yearly',
            },
        };

        setSelectedPlan(plans[planType]);
        setModalVisible(true);
    };

    const skyColor = isNight ? '#020205' : '#87CEEB';
    const cloudColor = isNight ? '#A0AEC0' : '#FFFFFF';
    const groundColor = isNight ? '#2E313F' : '#38A169';
    const groundBorderColor = isNight ? '#44495D' : '#2F855A';

    const animationRef = useRef(null);

    useEffect(() => {
        animationRef.current?.play();
    }, []);

    const translateX = useRef(new Animated.Value(-250)).current; // Commence hors écran à gauche

    // Animations pour chaque ShopButton - commencent tous au centre du bas
    const button1Anim = useRef(new Animated.ValueXY({ x: 0, y: 200 })).current;
    const button2Anim = useRef(new Animated.ValueXY({ x: 0, y: 200 })).current;
    const button3Anim = useRef(new Animated.ValueXY({ x: 0, y: 200 })).current;
    const button4Anim = useRef(new Animated.ValueXY({ x: 0, y: 200 })).current;
    const button5Anim = useRef(new Animated.ValueXY({ x: 0, y: 200 })).current;

    const scale1 = useRef(new Animated.Value(0.5)).current;
    const scale2 = useRef(new Animated.Value(0.5)).current;
    const scale3 = useRef(new Animated.Value(0.5)).current;
    const scale4 = useRef(new Animated.Value(0.5)).current;
    const scale5 = useRef(new Animated.Value(0.5)).current;

    const opacity1 = useRef(new Animated.Value(0)).current;
    const opacity2 = useRef(new Animated.Value(0)).current;
    const opacity3 = useRef(new Animated.Value(0)).current;
    const opacity4 = useRef(new Animated.Value(0)).current;
    const opacity5 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        animationRef.current?.play();

        // Animation de déplacement de gauche à droite pour le chien
        Animated.timing(translateX, {
            toValue: Dimensions.get('window').width, // Se déplace vers la droite hors écran
            duration: 8000, // 8 secondes pour traverser l'écran
            useNativeDriver: true,
        }).start();

        // Animations séquentielles pour les boutons
        const { width } = Dimensions.get('window');
        const centerX = width / 2;


        setTimeout(() => {

            // Button 1 (5 jetons)
            Animated.parallel([
                Animated.spring(button1Anim, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }),
                Animated.timing(opacity1, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(scale1, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }),
            ]).start();

            // Button 2 (10 jetons)
            setTimeout(() => {
                Animated.parallel([
                    Animated.spring(button2Anim, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }),
                    Animated.timing(opacity2, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scale2, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }),
                ]).start();
            }, 150);

            // Button 3 (20 jetons)
            setTimeout(() => {
                Animated.parallel([
                    Animated.spring(button3Anim, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }),
                    Animated.timing(opacity3, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scale3, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }),
                ]).start();
            }, 300);

            // Button 4 (Mensuel)
            setTimeout(() => {
                Animated.parallel([
                    Animated.spring(button4Anim, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }),
                    Animated.timing(opacity4, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scale4, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }),
                ]).start();
            }, 450);

            // Button 5 (Annuel)
            setTimeout(() => {
                Animated.parallel([
                    Animated.spring(button5Anim, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }),
                    Animated.timing(opacity5, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scale5, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }),
                ]).start(() => {
                });
            }, 600);
        }, 300);

    }, []);

    const renderStars = (count: number) => {
        const stars = [];
        const { width, height } = Dimensions.get('window');

        for (let i = 0; i < count; i++) {
            const size = Math.random() * 2 + 1;
            const top = Math.random() * (height * 0.5);
            const left = Math.random() * width;
            const opacity = Math.random() * 0.8 + 0.2;

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
        <View className="flex-1 flex-col overflow-hidden pt-4 px-4 relative" style={{ backgroundColor: isNight ? '#020205' : '#87CEEB' }}>
            {isNight && renderStars(50)}
            <View
                className='absolute bottom-0 left-0 right-0 border-t-4 h-[75px] z-10 flex flex-row items-center justify-between p-4'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className=""
                >
                    <Feather name="chevron-left" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <Text className={`font-baloo-semibold text-4xl pt-10 ${isNight ? "text-white" : "text-slate-900"}`}>Boutique</Text>

            {/* Boutons de jetons*/}
            <View className='flex-col w-full mt-4'>
                <Text className={`font-baloo-semibold text-2xl -mb-2 ${isNight ? 'text-white' : 'text-slate-900'}`}>Paquets de Jetons</Text>
                <View className='flex-row w-full gap-2'>
                    <Animated.View
                        style={{
                            flex: 1,
                            zIndex: 20,
                            opacity: opacity1,
                            transform: [
                                ...button1Anim.getTranslateTransform(),
                                { scale: scale1 }
                            ],
                        }}
                    >
                        <ShopButton amount={5} isNight={isNight} isCoin={true} title="Jetons" price="$4.99" onPress={() => buy('tokens_pack_5')} />
                    </Animated.View>

                    {/* Button 10 jetons - En bas à gauche */}
                    <Animated.View
                        style={{
                            flex: 1,
                            zIndex: 20,
                            opacity: opacity2,
                            transform: [
                                ...button2Anim.getTranslateTransform(),
                                { scale: scale2 }
                            ],
                        }}
                    >
                        <ShopButton amount={10} isNight={isNight} isCoin={true} title="Jetons" price="$9.99" onPress={() => buy('tokens_pack_10')} />
                    </Animated.View>

                    {/* Button 20 jetons - En bas à droite */}
                    <Animated.View
                        style={{
                            flex: 1,
                            zIndex: 20,
                            opacity: opacity3,
                            transform: [
                                ...button3Anim.getTranslateTransform(),
                                { scale: scale3 }
                            ],
                        }}
                    >
                        <ShopButton amount={20} isNight={isNight} isCoin={true} title="Jetons" price="$18.99" onPress={() => buy('tokens_pack_20')} />
                    </Animated.View >
                </View>
            </View>

            {/* Boutons Premium*/}
            <View className='flex flex-col w-full'>
                <Text className={`z-20 font-baloo-semibold text-2xl mt-4 -mb-2 ${isNight ? 'text-white' : 'text-slate-900'}`}>Abonnements</Text>
                <View className='flex-row w-full gap-2'>
                    <Animated.View
                        style={{
                            flex: 1,
                            zIndex: 20,
                            opacity: opacity4,
                            transform: [
                                ...button4Anim.getTranslateTransform(),
                                { scale: scale4 }
                            ],
                        }}
                    >
                        <ShopButton value='Hisoire partagées' isNight={isNight} title="Explorateur" price="Dès $4.99" onPress={() => openSubscriptionModal('explorer')} />
                    </Animated.View>
                    <Animated.View
                        style={{
                            flex: 1,
                            zIndex: 20,
                            opacity: opacity4,
                            transform: [
                                ...button4Anim.getTranslateTransform(),
                                { scale: scale4 }
                            ],
                        }}
                    >
                        <ShopButton value='Hisoire partagées' value2='1 Jetons par jour' isNight={isNight} title="Aventurier" price="Dès $14.99" onPress={() => openSubscriptionModal('adventurer')} />
                    </Animated.View>
                    <Animated.View
                        style={{
                            flex: 1,
                            opacity: opacity5,
                            zIndex: 20,
                            transform: [
                                ...button5Anim.getTranslateTransform(),
                                { scale: scale5 }
                            ],
                        }}
                    >
                        <ShopButton value='Hisoire partagées' isNight={isNight} value2='2 Jetons par jour' title="Légende" price="Dès $19.99" onPress={() => openSubscriptionModal('legend')} />
                    </Animated.View>
                </View>
            </View>
            {/* Chien */}
            {
                !isNight && (
                    <Animated.View
                        style={{
                            transform: [{ translateX }],
                            position: 'absolute',
                            bottom: 26,
                            left: 0,
                            zIndex: 5
                        }}
                    >
                        <LottieView
                            ref={animationRef}
                            source={require('../../assets/animations/MoodyDog.json')}
                            autoPlay
                            loop={true}
                            style={{ width: 200, height: 200, zIndex: 10 }}
                        />
                    </Animated.View>
                )
            }
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: -75,
                    left: 20,
                    zIndex: 1
                }}
                className="self-center"
            >
                <LottieView
                    source={require('../../assets/animations/Store.json')}
                    autoPlay
                    loop={false}
                    style={{ width: 500, height: 500, zIndex: 5 }}
                />
            </Animated.View>
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: 60,
                    left: -140,
                }}
            >
                <LottieView
                    ref={animationRef}
                    source={require('../../assets/animations/tree.json')}
                    autoPlay
                    loop={false}
                    style={{ width: 500, height: 500 }}
                />
            </Animated.View>

            {/* Modal d'abonnement */}
            {selectedPlan && (
                <SubscriptionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    planName={selectedPlan.name}
                    planFeatures={selectedPlan.features}
                    monthlyPrice={selectedPlan.monthlyPrice}
                    yearlyPrice={selectedPlan.yearlyPrice}
                    onSelectMonthly={() => {
                        setModalVisible(false);
                        buy(selectedPlan.monthlyProductId);
                    }}
                    onSelectYearly={() => {
                        setModalVisible(false);
                        buy(selectedPlan.yearlyProductId);
                    }}
                    isNight={isNight}
                />
            )}
        </View >
    );
};
