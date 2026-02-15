import React, { useEffect, useRef } from 'react';
import { Animated, Easing, useWindowDimensions, View, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';
import { useStoryCreationStore } from '~/store/useStoryCreationStore';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import StarryBackground from './StarryBackground';
import { useTranslation } from 'react-i18next';

type StoryPage = {
    page: number;
    text: string;
    imageUrl: string;
};

type StoryModalProps = {
    loading: boolean;
    title: string;
    description: string | null;
    coverUrl: string | null;
    storyPages: StoryPage[];
    storyId: string | null;
    onClose: () => void;
};

export default function StoryModal({ loading, title, description, coverUrl, storyPages, storyId, onClose }: StoryModalProps) {
    const { t } = useTranslation();
    const { close } = useStoryCreationStore();
    const { width: screenWidth } = useWindowDimensions();
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const dayNightAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Animation slide du modal (entrée)
    const modalSlideAnim = useRef(new Animated.Value(-600)).current;
    const modalOpacityAnim = useRef(new Animated.Value(0)).current;

    // Animation slide du contenu "histoire prête"
    const contentSlideAnim = useRef(new Animated.Value(-100)).current;
    const contentOpacityAnim = useRef(new Animated.Value(0)).current;

    // Animation d'entrée du modal
    useEffect(() => {
        Animated.parallel([
            Animated.spring(modalSlideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }),
            Animated.timing(modalOpacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Animation du contenu quand le loading passe à false
    useEffect(() => {
        if (!loading) {
            // Reset et anime le contenu
            contentSlideAnim.setValue(-100);
            contentOpacityAnim.setValue(0);

            Animated.parallel([
                Animated.spring(contentSlideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                    delay: 200,
                }),
                Animated.timing(contentOpacityAnim, {
                    toValue: 1,
                    duration: 400,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [loading]);

    // Rotation infinie du cercle soleil/lune
    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 40000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);
    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Ciel jour/nuit
    useEffect(() => {
        // Dans le useEffect
        Animated.loop(
            Animated.sequence([
                Animated.timing(dayNightAnim, {
                    toValue: 1,
                    duration: 20000,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(dayNightAnim, {
                    toValue: 0,
                    duration: 20000,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
            ])
        ).start();

    }, []);
    const animatedSkyColor = dayNightAnim.interpolate({
        inputRange: [0, 0.35, 0.5, 0.65, 1],
        outputRange: [
            'rgba(135,206,235,1)', // #87CEEB (jour - bleu ciel)
            'rgba(135,206,235,1)', // #87CEEB (jour - bleu ciel)
            'rgba(255,165,0,1)',   // #FFA500 (coucher de soleil - orange)
            'rgba(2,2,5,1)',        // #020205 (nuit - noir)
            'rgba(2,2,5,1)'        // #020205 (nuit - noir)
        ],
    });

    const starsOpacity = dayNightAnim.interpolate({
        inputRange: [0, 0.4, 0.6, 1],
        outputRange: [0, 0, 1, 1],
    });

    const groundColor = dayNightAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [
            'rgba(56,161,105,1)',  // #38A169 (jour)
            'rgba(56,161,105,1)',  // #38A169 (transition)
            'rgba(46,49,63,1)'     // #2E313F (nuit)
        ],
    });

    const groundBorderColor = dayNightAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [
            'rgba(47,133,90,1)',   // #2F855A (jour)
            'rgba(47,133,90,1)',   // #2F855A (transition)
            'rgba(68,73,93,1)'     // #44495D (nuit)
        ],
    });

    const textColor = dayNightAnim.interpolate({
        inputRange: [0, 0.3, 0.5, 0.7, 1],
        outputRange: [
            'rgba(0,0,0,1)',       // #000000 (noir - jour)
            'rgba(0,0,0,1)',       // #000000 (noir - transition)
            'rgba(255,255,255,1)',  // #FFFFFF (blanc - nuit)
            'rgba(255,255,255,1)',  // #FFFFFF (blanc - nuit)
            'rgba(255,255,255,1)',  // #FFFFFF (blanc - nuit)


        ],
    });


    // Animation de sortie du modal
    const animateOut = (callback: () => void) => {
        Animated.parallel([
            Animated.timing(modalSlideAnim, {
                toValue: -600,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.in(Easing.ease),
            }),
            Animated.timing(modalOpacityAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => callback());
    };

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>
            <TouchableOpacity
                activeOpacity={1}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
            />
            <Animated.View
                className="absolute flex flex-col bottom-28 left-4 right-4 border-4 border-white h-[66vh] rounded-2xl shadow-lg z-50"
                style={{
                    transform: [{ translateY: modalSlideAnim }],
                    opacity: modalOpacityAnim,
                }}
            >
                <Animated.View
                    style={{
                        flex: 1,
                        backgroundColor: animatedSkyColor,
                        overflow: 'hidden',
                        borderRadius: 10,
                    }}
                >
                    {/* Étoiles */}
                    <StarryBackground starCount={50} animatedStyle={{ opacity: starsOpacity }} />

                    {/* Cercle Soleil / Lune */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            aspectRatio: 1,
                            width: screenWidth - 32,
                            justifyContent: 'center',
                            alignItems: 'center',
                            top: 200,
                            transform: [{ rotate }],
                        }}
                    >
                        {/* Soleil */}
                        <View className='w-20 h-20 md:w-[150px] md:h-[150px]' style={{
                            position: 'absolute',
                            top: 0,
                            borderRadius: 9999,
                            backgroundColor: '#FFD700',
                        }} />
                        <View className='w-20 h-20 md:w-[150px] md:h-[150px]' style={{
                            position: 'absolute',
                            bottom: 0,
                            borderRadius: 9999,
                            backgroundColor: '#ffffff',
                        }} />
                        {/* Lune */}
                        {/* <Animated.View
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                alignSelf: 'center',
                            }}
                        >
                            <LottieView
                                source={require('../../assets/animations/moon.json')}
                                autoPlay

                                loop={true}
                                style={{
                                    width: 300, height: 300, position: 'absolute',
                                    bottom: 0,
                                }}
                            />
                        </Animated.View> */}
                    </Animated.View>



                    {/* Contenu texte et boutons */}
                    {loading ? (
                        <View className="flex-1 w-full justify-between relative p-4 md:p-6">
                            <Animated.View
                                className="h-24 md:h-28"
                                style={{
                                    backgroundColor: groundColor,
                                    borderTopWidth: 4,
                                    borderColor: groundBorderColor,
                                    width: '120%',
                                    alignSelf: 'center',
                                    aspectRatio: 1,
                                    position: 'absolute',
                                    bottom: 0,
                                }}
                            />
                            <View style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 8 }} className='p-4 md:p-6 flex flex-col justify-center items-center w-full'>
                                <View style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 8 }} className='bg-white p-4 w-full'>
                                    <Animated.Text className="text-xl font-baloo-medium text-center ">
                                        {t('storyCreation.creationInProgress')}
                                    </Animated.Text>


                                </View>
                                <LottieView
                                    source={require('../../assets/animations/LoadingWhite.json')}
                                    autoPlay
                                    loop={true}
                                    style={{ width: 100, height: 100 }}
                                />
                            </View>
                            <View className='bg-white p-4 w-11/12 rounded-xl  my-4'>
                                <Animated.Text className="text-base font-baloo text-center">
                                    {t('storyCreation.creationWaitMessage')}
                                </Animated.Text>
                            </View>
                        </View>
                    ) : (
                        <View className="flex-1 w-full justify-between relative p-4 md:p-6">
                            <Animated.View
                                className="h-24 md:h-28"
                                style={{
                                    backgroundColor: groundColor,
                                    borderTopWidth: 4,
                                    borderColor: groundBorderColor,
                                    width: '120%',
                                    alignSelf: 'center',
                                    aspectRatio: 1,
                                    position: 'absolute',
                                    bottom: 0,
                                }}
                            />
                            <Animated.View
                                style={{
                                    transform: [{ translateY: contentSlideAnim }],
                                    opacity: contentOpacityAnim,
                                }}
                            >
                                <View style={{ borderRadius: 10, overflow: 'hidden' }} className='bg-white p-4 mb-4'>
                                    <Animated.Text className="text-xl md:text-2xl font-baloo-medium text-center">
                                        {t('storyCreation.storyReady')}
                                    </Animated.Text>
                                </View>

                                {coverUrl && (
                                    <View style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                                        <BlurView intensity={90} tint="light" style={{ padding: 16 }}>
                                            <Animated.Text className="font-baloo-bold text-3xl md:text-4xl md:p-4 text-center" style={{ color: textColor }}>
                                                {title}
                                            </Animated.Text>
                                            <View className='rounded-full self-center overflow-hidden w-1/2 aspect-square'>
                                                <Image
                                                    source={{ uri: coverUrl }}
                                                    style={{ width: '100%', height: '100%' }}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                            {description && (
                                                <Animated.Text
                                                    className="font-baloo text-base md:text-lg text-center mt-2"
                                                    style={{ color: textColor }}
                                                    numberOfLines={2}
                                                >
                                                    {description}
                                                </Animated.Text>
                                            )}
                                        </BlurView>
                                    </View>
                                )}
                            </Animated.View>
                            <TouchableOpacity
                                className='bg-white p-4 rounded-full'
                                onPress={() => {
                                    if (storyId) {
                                        animateOut(() => {
                                            navigation.navigate('StoryDetail', { storyId: Number(storyId) });
                                            onClose();
                                        });
                                    }
                                }}
                            >
                                <Animated.Text className="text-lg md:text-xl font-baloo-medium text-center">
                                    {t('storyCreation.discoverStory')}
                                </Animated.Text>
                            </TouchableOpacity>
                        </View>
                    )
                    }
                </Animated.View >
            </Animated.View >
        </View>
    );
}
