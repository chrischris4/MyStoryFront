import React, { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, useWindowDimensions, TouchableOpacity, Animated } from 'react-native';
import ShopButton from '~/components/ShopButton';
import SubscriptionModal from '~/components/SubscriptionModal';
import { useTheme } from '~/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/types';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import { useIAP } from '~/hooks/useIAP';
import { usePurchaseProduct } from '~/hooks/usePurchaseProduct';
import { usePurchaseSubscription } from '~/hooks/usePurchaseSubscription';
import { useTranslation } from 'react-i18next';
import Background from '~/components/Background';

type StoryDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BillingScreen() {
    const { t } = useTranslation();
    const { bottom: bottomInset } = useSafeAreaInsets();
    const storePhrases = t('billing.storePhrases', { returnObjects: true }) as string[];

    function StoreBubble({
        text,
        style,
    }: {
        text: string;
        style: any;
    }) {
        return (
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        backgroundColor: 'white',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        width: 'auto',
                        shadowColor: '#000',
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 4,
                    },
                    style,
                ]}
            >
                <Text
                    style={{
                        fontSize: 12,
                        color: '#333',
                        textAlign: 'center',
                    }}
                    className='font-baloo-semibold text-xl md:text-2xl'
                >
                    {text}
                </Text>
                <View
                    style={{
                        position: 'absolute',
                        bottom: -8,
                        right: 20,
                        width: 0,
                        height: 0,
                        borderLeftWidth: 8,
                        borderRightWidth: 8,
                        borderTopWidth: 8,
                        borderLeftColor: 'transparent',
                        borderRightColor: 'transparent',
                        borderTopColor: 'white',
                    }}
                />
            </Animated.View>
        );
    }



    const [showBubble, setShowBubble] = useState(false);
    const showStoreBubble = () => {
        const random =
            storePhrases[Math.floor(Math.random() * storePhrases.length)];

        setStorePhrase(random);
        setShowBubble(true);

        bubbleOpacity.setValue(0);
        bubbleScale.setValue(0.8);

        Animated.parallel([
            Animated.timing(bubbleOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(bubbleScale, {
                toValue: 1,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Disparition après 6s
        setTimeout(() => {
            Animated.timing(bubbleOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setShowBubble(false);
            });
        }, 6000);
    };
    useEffect(() => {
        // Première apparition après 4s
        const firstTimeout = setTimeout(() => {
            showStoreBubble();
        }, 2000);

        // Puis toutes les 20s
        const interval = setInterval(() => {
            showStoreBubble();
        }, 20000);

        return () => {
            clearTimeout(firstTimeout);
            clearInterval(interval);
        };
    }, []);
    const bubbleOpacity = useRef(new Animated.Value(0)).current;
    const bubbleScale = useRef(new Animated.Value(0.8)).current;

    const [storePhrase, setStorePhrase] = useState<string | null>(null);

    const navigation = useNavigation<StoryDetailNavigationProp>();

    // === HOOKS IAP ===
    const { requestPurchase, setOnPurchaseSuccess, setOnPurchaseError, isLoading: iapLoading } = useIAP();
    const { mutate: verifyProduct, isPending: isVerifyingProduct } = usePurchaseProduct();
    const { mutate: verifySubscription, isPending: isVerifyingSubscription } = usePurchaseSubscription();

    const { isNight } = useTheme();
    const { width: screenWidth } = useWindowDimensions();
    const isTablet = screenWidth >= 768;

    // États pour la modal d'abonnement
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{
        name: string;
        planId: number;
        features: string[];
        monthlyPrice: string;
        yearlyPrice: string;
        monthlyProductId: string;
        yearlyProductId: string;
    } | null>(null);

    // Mapping des productId vers planId (à adapter selon ta BDD)
    const planIdMapping: Record<string, number> = {
        'explorer_monthly': 1,
        'explorer_yearly': 1,
        'adventurer_monthly': 2,
        'adventurer_yearly': 2,
        'legend_monthly': 3,
        'legend_yearly': 3,
    };

    // Configurer les callbacks IAP
    useEffect(() => {
        setOnPurchaseSuccess(async (purchase) => {
            const isTokenPack = purchase.productId.includes('tokens_pack');

            if (isTokenPack) {
                // Valider l'achat de jetons côté backend
                verifyProduct(
                    {
                        productId: purchase.productId,
                        transactionId: purchase.transactionId,
                        receipt: purchase.transactionReceipt,
                        purchaseToken: purchase.purchaseToken,
                    },
                    {
                        onSuccess: (data) => {
                            Toast.show({
                                type: 'success',
                                text1: t('billing.tokensPurchased'),
                                text2: t('billing.tokensReceived', { count: data.coinsAdded }),
                                props: { emoji: '🪙' },
                            });
                        },
                        onError: (error) => {
                            Toast.show({
                                type: 'error',
                                text1: t('billing.validationError'),
                                text2: error.message,
                            });
                        },
                    }
                );
            } else {
                // Valider l'abonnement côté backend
                const planId = planIdMapping[purchase.productId] || 1;
                verifySubscription(
                    {
                        productId: purchase.productId,
                        planId,
                        transactionId: purchase.transactionId,
                        receipt: purchase.transactionReceipt,
                        purchaseToken: purchase.purchaseToken,
                    },
                    {
                        onSuccess: () => {
                            Toast.show({
                                type: 'success',
                                text1: t('billing.subscriptionActivated'),
                                text2: t('billing.welcomePremium'),
                                props: { emoji: '⭐' },
                            });
                        },
                        onError: (error) => {
                            Toast.show({
                                type: 'error',
                                text1: t('billing.validationError'),
                                text2: error.message,
                            });
                        },
                    }
                );
            }
        });

        setOnPurchaseError((error) => {
            Toast.show({
                type: 'error',
                text1: t('billing.purchaseError'),
                text2: error.message,
            });
        });
    }, [t]);

    const buy = async (sku: string) => {
        try {
            await requestPurchase(sku);
        } catch (err: any) {
            console.warn('Erreur achat', err);
            Toast.show({
                type: 'error',
                text1: t('billing.purchaseError'),
                text2: err.message || t('errors.unknownError'),
            });
        }
    };

    const openSubscriptionModal = (planType: 'explorer' | 'adventurer' | 'legend') => {
        const plans = {
            explorer: {
                name: t('plans.explorer'),
                planId: 1,
                features: [t('billing.sharedStories'), t('billing.cancelAnytime')],
                monthlyPrice: `$4.99/${t('billing.month')}`,
                yearlyPrice: `$49.99/${t('billing.year')}`,
                monthlyProductId: 'explorer_monthly',
                yearlyProductId: 'explorer_yearly',
            },
            adventurer: {
                name: t('plans.adventurer'),
                planId: 2,
                features: [t('billing.sharedStories'), t('billing.tokensPerDay', { count: 1 }), t('billing.cancelAnytime')],
                monthlyPrice: `$14.99/${t('billing.month')}`,
                yearlyPrice: `$149.99/${t('billing.year')}`,
                monthlyProductId: 'adventurer_monthly',
                yearlyProductId: 'adventurer_yearly',
            },
            legend: {
                name: t('plans.legend'),
                planId: 3,
                features: [t('billing.sharedStories'), t('billing.tokensPerDay_plural', { count: 2 }), t('billing.charactersAllowed'), t('billing.cancelAnytime')],
                monthlyPrice: `$19.99/${t('billing.month')}`,
                yearlyPrice: `$199.99/${t('billing.year')}`,
                monthlyProductId: 'legend_monthly',
                yearlyProductId: 'legend_yearly',
            },
        };

        setSelectedPlan(plans[planType]);
        setModalVisible(true);
    };

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
            toValue: screenWidth, // Se déplace vers la droite hors écran
            duration: 8000, // 8 secondes pour traverser l'écran
            useNativeDriver: true,
        }).start();

        // Animations séquentielles pour les boutons
        const centerX = screenWidth / 2;


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

    return (
        <View className="flex-1 flex-col overflow-hidden pt-4 px-4 md:px-8 relative" style={{ backgroundColor: isNight ? '#020205' : '#87CEEB' }}>
            {/* 🌤️ Background animé */}
            <Background isNight={isNight} />
            <View
                className='absolute bottom-0 left-0 right-0 border-t-4 h-[75px] z-30 flex flex-row items-center justify-between p-4'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor, bottom: bottomInset }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="px-4"
                >
                    <Feather name="chevron-left" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <Text className={`font-baloo-semibold text-4xl md:text-5xl pt-10 ${isNight ? "text-white" : "text-slate-900"}`}>{t('billing.title')}</Text>

            {/* Boutons de jetons*/}
            <View className='flex-col w-full mt-4'>
                <View className='flex flex-row gap-2 items-center'>
                    <Text className={`font-baloo-semibold text-2xl md:text-3xl -mb-2 ${isNight ? 'text-white' : 'text-slate-900'}`}>{t('billing.tokenPacks')}</Text>
                    <Text className={`font-baloo text-base md:text-lg -mb-1 ${isNight ? 'text-white' : 'text-slate-900'}`}>{t('billing.tokenInfo')}</Text>
                </View>
                <View className='flex-row w-full gap-2 md:gap-4'>
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
                        <ShopButton amount={5} isNight={isNight} isCoin={true} title={t('billing.tokens')} price="$4.99" onPress={() => buy('tokens_pack_5')} />
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
                        <ShopButton amount={10} isNight={isNight} isCoin={true} title={t('billing.tokens')} price="$9.99" onPress={() => buy('tokens_pack_10')} />
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
                        <ShopButton amount={20} isNight={isNight} isCoin={true} title={t('billing.tokens')} price="$18.99" onPress={() => buy('tokens_pack_20')} />
                    </Animated.View >
                </View>
            </View>

            {/* Boutons Premium*/}
            <View className='flex flex-col w-full'>
                <Text className={`z-20 font-baloo-semibold text-2xl md:text-3xl mt-4 md:mt-6 -mb-2 ${isNight ? 'text-white' : 'text-slate-900'}`}>{t('billing.subscriptions')}</Text>
                <View className='flex-row w-full gap-2 md:gap-4'>
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
                        <ShopButton description={t('billing.explorerCatchphrase')} isNight={isNight} title={t('plans.explorer')} price={`${t('billing.from')} $4.99`} onPress={() => openSubscriptionModal('explorer')} />
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
                        <ShopButton description={t('billing.adventurerCatchphrase')} isNight={isNight} title={t('plans.adventurer')} price={`${t('billing.from')} $14.99`} onPress={() => openSubscriptionModal('adventurer')} />
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
                        <ShopButton description={t('billing.legendCatchphrase')} isNight={isNight} title={t('plans.legend')} price={`${t('billing.from')} $19.99`} onPress={() => openSubscriptionModal('legend')} />
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
                            bottom: 26 + bottomInset,
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
                    bottom: (isTablet ? -40 : -45) + bottomInset,
                    left: isTablet ? 140 : 60,
                    zIndex: 1
                }}
                className="self-center">
                <View style={{ position: 'relative' }}>
                    {/* BULLE UNIQUE */}
                    {showBubble && storePhrase && (
                        <StoreBubble
                            text={storePhrase}
                            style={{
                                position: 'absolute',
                                top: isTablet ? 200 : 140,
                                right: isTablet ? 400 : 220,
                                zIndex: 10,
                                opacity: bubbleOpacity,
                                transform: [{ scale: bubbleScale }],
                            }}
                        />
                    )}

                    {/* STORE */}
                    <LottieView
                        source={require('../../assets/animations/Store.json')}
                        autoPlay
                        loop={false}
                        style={{ width: isTablet ? 700 : 400, height: isTablet ? 500 : 400 }}
                    />
                </View>
            </Animated.View>


            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: 75 + bottomInset,
                    left: isTablet ? -50 : -60,
                }}
            >
                <LottieView
                    ref={animationRef}
                    source={require('../../assets/animations/tree.json')}
                    autoPlay
                    loop={false}
                    style={{ width: isTablet ? 700 : 400, height: isTablet ? 500 : 400 }}
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
