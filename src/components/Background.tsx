import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import StarryBackground from './StarryBackground';

type BackgroundProps = {
    isNight?: boolean;
};

export default function Background({ isNight = false }: BackgroundProps) {
    const cloudAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(cloudAnim, {
                toValue: 1000,
                duration: 100000,
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
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
            />

            
            {/* Nuages */}
            <Animated.View
                style={{ transform: [{ translateX: cloudAnim }] }}
                className='absolute top-40 -left-4'
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

            <Animated.View
                style={{ transform: [{ translateX: cloudAnim }] }}
                className='absolute top-96 -left-96'
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

            <Animated.View
                style={{ transform: [{ translateX: cloudAnim }] }}
                className='absolute top-72 right-10'
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
        </View>
    </View> 
    );
}
