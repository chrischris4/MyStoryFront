import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StarryBackground from './StarryBackground';

type BackgroundProps = {
    isNight?: boolean;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const CLOUD_WIDTH = 250; // Largeur approximative d'un nuage
// Distance totale: du nuage le plus à gauche (-CLOUD_WIDTH - SCREEN_WIDTH * 1.5) jusqu'à sortie droite
const TOTAL_TRAVEL = SCREEN_WIDTH * 3.5 + CLOUD_WIDTH * 2;

export default function Background({ isNight = false }: BackgroundProps) {
    const cloudAnim = useRef(new Animated.Value(0)).current;
    const { bottom: bottomInset } = useSafeAreaInsets();

    useEffect(() => {
        Animated.loop(
            Animated.timing(cloudAnim, {
                toValue: TOTAL_TRAVEL,
                duration: 120000, // 1min pour traverser l'écran
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);



    // 🔹 Couleurs nuit
    const skyColor = isNight ? '#020205' : '#87CEEB';
    const cloudColor = isNight ? '#6b7588' : '#FFFFFF';
    const groundColor = isNight ? '#2E313F' : '#38A169';
    const groundBorderColor = isNight ? '#44495D' : '#2F855A';

    return (
        <View className='absolute top-0 left-0 w-full h-screen'>
        <View
            className="flex-1 p-4 relative"
            style={{ backgroundColor: skyColor }}
        >
            {isNight && <StarryBackground starCount={50} />}

            {/* Sol */}
            <View
                className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-30'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor, bottom: bottomInset }}
            />
            <View
                className='absolute bottom-0 -left-10 h-[75px] w-[200%] z-20'
                style={{ backgroundColor: groundColor }}
            />

            
            {/* Nuages - répartis pour une boucle fluide
                Position initiale: certains visibles, d'autres hors écran à gauche
                Tous sortent à droite, puis reset et recommencent */}

            {/* Nuage 1 - visible au démarrage, côté gauche */}
            <Animated.View
                style={{
                    transform: [{ translateX: cloudAnim }],
                    left: -CLOUD_WIDTH * 1.5,
                }}
                className='absolute top-40'
            >
                <View className='w-60 h-44 relative'>
                    <View
                        className='h-20 rounded-full absolute top-10 left-0 w-full'
                        style={{ backgroundColor: cloudColor }}
                    />
                    <View
                        className='h-24 w-24 rounded-full absolute top-0 left-10'
                        style={{ backgroundColor: cloudColor }}
                    />
                    <View
                        className='h-20 w-20 rounded-full absolute top-4 left-28'
                        style={{ backgroundColor: cloudColor }}
                    />
                </View>
            </Animated.View>

            {/* Nuage 2 - hors écran gauche, entre plus tard */}
            <Animated.View
                style={{
                    transform: [{ translateX: cloudAnim }],
                    left: -CLOUD_WIDTH - SCREEN_WIDTH * 0.5,
                }}
                className='absolute top-96'
            >
                <View className='w-52 h-44 relative'>
                    <View
                        className='h-14 rounded-full absolute top-10 left-0 w-full'
                        style={{ backgroundColor: cloudColor }}
                    />
                    <View
                        className='h-20 w-20 rounded-full absolute top-0 right-12'
                        style={{ backgroundColor: cloudColor }}
                    />
                    <View
                        className='h-16 w-16 rounded-full absolute top-4 right-28'
                        style={{ backgroundColor: cloudColor }}
                    />
                </View>
            </Animated.View>

            {/* Nuage 3 - plus loin hors écran gauche */}
            <Animated.View
                style={{
                    transform: [{ translateX: cloudAnim }],
                    left: -CLOUD_WIDTH - SCREEN_WIDTH,
                }}
                className='absolute top-72'
            >
                <View className='w-52 h-44 relative'>
                    <View
                        className='h-14 rounded-full absolute top-10 left-0 w-full'
                        style={{ backgroundColor: cloudColor }}
                    />
                    <View
                        className='h-20 w-20 rounded-full absolute top-0 right-12'
                        style={{ backgroundColor: cloudColor }}
                    />
                    <View
                        className='h-16 w-16 rounded-full absolute top-4 right-28'
                        style={{ backgroundColor: cloudColor }}
                    />
                </View>
            </Animated.View>

            {/* Nuage 4 - petit nuage très décalé */}
            <Animated.View
                style={{
                    transform: [{ translateX: cloudAnim }],
                    left: -CLOUD_WIDTH - SCREEN_WIDTH * 1.5,
                }}
                className='absolute top-56'
            >
                <View className='w-40 h-32 relative'>
                    <View
                        className='h-12 rounded-full absolute top-8 left-0 w-full'
                        style={{ backgroundColor: cloudColor }}
                    />
                    <View
                        className='h-16 w-16 rounded-full absolute top-0 left-6'
                        style={{ backgroundColor: cloudColor }}
                    />
                    <View
                        className='h-14 w-14 rounded-full absolute top-2 left-16'
                        style={{ backgroundColor: cloudColor }}
                    />
                </View>
            </Animated.View>
        </View>
    </View> 
    );
}
