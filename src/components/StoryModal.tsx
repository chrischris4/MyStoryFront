import React, { useEffect, useRef } from 'react';
import { Animated, Easing, useWindowDimensions, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
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
    storyPages: StoryPage[];
    storyId: string | null;
    onClose: () => void;
};

export default function StoryModal({ loading, title, storyPages, storyId, onClose }: StoryModalProps) {
    const { t } = useTranslation();
    const { minimize } = useStoryCreationStore();
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const dayNightAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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


    const { width: screenWidth } = useWindowDimensions();
    const orbitSize = screenWidth * 1.4;
    const sunSize = orbitSize * 0.22;
    const moonSize = orbitSize * 0.15;

    const handleMinimize = () => {
        minimize();
    };

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>

            {/* Cet overlay transparent (ou semi-noir) intercepte les clics */}
            <TouchableOpacity
                activeOpacity={1}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} // Optionnel: assombrit le fond
                onPress={() => { /* Optionnel: fermer la modal au clic extérieur */ }}
            />
            <View
                className="absolute flex flex-col bottom-28 left-4 right-4 border-4 border-white h-[66vh] rounded-2xl shadow-lg z-50"
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
                            width: orbitSize,
                            height: orbitSize,
                            justifyContent: 'center',
                            alignItems: 'center',
                            top: 60,
                            right: -100,
                            transform: [{ rotate }],
                        }}
                    >
                        {/* Soleil */}
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            width: sunSize,
                            height: sunSize,
                            borderRadius: 100,
                            backgroundColor: '#FFD700',
                        }} />
                        {/* Lune */}
                        <Animated.View
                            style={{
                                position: 'absolute',
                                bottom: 10,
                                alignSelf: 'center',
                            }}
                        >
                            <LottieView
                                source={require('../../assets/animations/moon.json')}
                                autoPlay

                                loop={true}
                                style={{
                                    width: 150, height: 150, position: 'absolute',
                                    bottom: 0,
                                }}
                            />
                        </Animated.View>
                    </Animated.View>



                    {/* Contenu texte et boutons */}
                    {loading ? (
                        <View className="flex h-full justify-end items-center relative mb-4">
                            <Animated.View
                                style={{
                                    backgroundColor: groundColor,
                                    borderWidth: 4,
                                    borderColor: groundBorderColor,
                                    width: '200%',
                                    alignSelf: 'center',
                                    aspectRatio: 1,
                                    borderRadius: 9999,
                                    position: 'absolute',
                                    bottom: '-130%',
                                }}
                            />
                            <View style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 8 }} className='bg-white p-4 w-11/12 abolute top-4'>
                                <Animated.Text className="text-xl font-baloo-medium text-center ">
                                    {t('storyCreation.creationInProgress')}
                                </Animated.Text>
                            </View>
                            <View className='bg-white p-4 w-11/12 rounded-xl  my-4'>
                                <Animated.Text className="text-base font-baloo text-center">
                                    {t('storyCreation.creationWaitMessage')}
                                </Animated.Text>
                            </View>
                        </View>
                    ) : (
                        <View className="flex-1 w-full justify-between relative p-2">
                            <Animated.View
                                style={{
                                    backgroundColor: groundColor,
                                    borderTopWidth: 4,
                                    borderColor: groundBorderColor,
                                    width: '200%',
                                    alignSelf: 'center',
                                    aspectRatio: 1,
                                    borderRadius: 9999,
                                    position: 'absolute',
                                    bottom: '-130%',
                                }}
                            />

                            <View>
                                <View style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 8 }} className='bg-white p-4'>
                                    <Animated.Text className="text-xl font-baloo text-center">
                                        {t('storyCreation.storyReady')}
                                    </Animated.Text>
                                </View>

                                {storyPages.length > 0 && (
                                    <View style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                                        <BlurView intensity={90} tint="light" style={{ padding: 16 }}>
                                            <Animated.Text className="font-baloo-bold text-3xl text-center" style={{ color: textColor }}>
                                                {title}
                                            </Animated.Text>
                                            <View className='rounded-full self-center overflow-hidden w-1/2 aspect-square'>
                                                <Image
                                                    source={{ uri: storyPages[0].imageUrl }}
                                                    style={{ width: '100%', height: 200, borderRadius: 16 }}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                        </BlurView>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity
                                style={{ borderRadius: 24, overflow: 'hidden' }}
                                className='bg-white p-4 -mb-2'
                                onPress={() => {
                                    if (storyId) {
                                        navigation.navigate('StoryDetail', { storyId: Number(storyId) });
                                        onClose();
                                    }
                                }}
                            >
                                <Animated.Text className="text-lg font-baloo-medium text-center">
                                    {t('storyCreation.discoverStory')}
                                </Animated.Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ borderRadius: 24, overflow: 'hidden' }}
                                className='bg-white p-4'
                                onPress={handleMinimize}
                            >
                                <Animated.Text className="text-lg font-baloo-medium text-center">
                                    {t('storyCreation.createNewStory')}
                                </Animated.Text>
                            </TouchableOpacity>
                        </View>
                    )
                    }
                </Animated.View >
            </View >
        </View>
    );
}
