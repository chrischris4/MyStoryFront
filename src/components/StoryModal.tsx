import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Dimensions, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';

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
        inputRange: [0, 0.5, 1],
        outputRange: [
            'rgba(135,206,235,1)', // #87CEEB
            'rgba(255,165,0,1)',   // #FFA500
            'rgba(2,2,5,1)'        // #020205
        ],
    });

    const starsOpacity = dayNightAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 1],
    });


    // Génération des étoiles
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
const { width: screenWidth } = Dimensions.get('window');
const orbitSize = screenWidth * 1.4;
const sunSize = orbitSize * 0.22;
const moonSize = orbitSize * 0.15;

    return (
        <View
            className="absolute bottom-24 left-4 right-4 bg-white h-[50vh] rounded-2xl p-1 shadow-lg z-50"
        >
            <Animated.View
                style={{
                    flex: 1,
                    backgroundColor: animatedSkyColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow:'hidden',
                    borderRadius: 10
                }}
            >
                {/* Étoiles */}
                <Animated.View style={{ opacity: starsOpacity }}>
                    {renderStars(50)}
                </Animated.View>

                {/* Cercle Soleil / Lune */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        width: orbitSize,          // cercle plus grand
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
                        width: sunSize,           // Soleil plus grand
                        height: sunSize,
                        borderRadius: 100,
                        backgroundColor: '#FFD700',
                    }} />
                    {/* Lune */}
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        width: moonSize,           // Lune plus grande
                        height: moonSize,
                        borderRadius: 100,
                        backgroundColor: '#F0F8FF',
                    }} />
                </Animated.View>



                {/* Contenu texte et boutons */}
                {loading ? (
                    <View className="flex-1 justify-end items-center mb-4">
                        <Text className="mt-4 text-lg font-semibold">Nous préparons votre histoire</Text>
                    </View>
                ) : (
                    <View className="flex-1 justify-center relative px-4">
                        <Text className="text-xl font-bold mb-4 text-center">Votre histoire est prête !</Text>

                        {storyPages.length > 0 && (
                            <View className="mb-4 bg-white p-4 rounded-3xl">
                                <Text className="text-2xl font-bold mb-2 text-center">{title}</Text>
                                <Image
                                    source={{ uri: storyPages[0].imageUrl }}
                                    style={{ width: '100%', height: 200, borderRadius: 16 }}
                                    resizeMode="cover"
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            className="bg-white px-4 py-3 rounded-3xl items-center mb-2"
                            onPress={() => storyId && navigation.navigate('StoryDetail', { storyId: Number(storyId) })}
                        >
                            <Text className="text-black font-semibold text-lg">Découvrir votre histoire</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-black px-4 py-3 rounded-3xl items-center"
                            onPress={onClose}
                        >
                            <Text className="text-white font-semibold text-lg">Revenir à la création</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </View>
    );
}
