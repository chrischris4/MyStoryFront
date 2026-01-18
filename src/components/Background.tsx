import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, useWindowDimensions } from 'react-native';
import StarryBackground from './StarryBackground';

type BackgroundProps = {
    isNight?: boolean;
};

export default function Background({ isNight = false }: BackgroundProps) {
    const { width } = useWindowDimensions();
    const cloudAnim = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(width)).current;

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

    const animationRef = useRef(null);

    useEffect(() => {
        animationRef.current?.play();
    }, []);

    useEffect(() => {
        animationRef.current?.play();

        Animated.timing(translateX, {
            toValue: -300,
            duration: 5000,
            useNativeDriver: true,
        }).start();
    }, []);

    // 🔹 Couleurs nuit
    const skyColor = isNight ? '#020205' : '#87CEEB';
    const cloudColor = isNight ? '#6b7588' : '#FFFFFF';
    const groundColor = isNight ? '#2E313F' : '#38A169';
    const groundBorderColor = isNight ? '#44495D' : '#2F855A';

    return (
        <View
            className="flex-1 p-4 relative"
            style={{ backgroundColor: skyColor }}
        >
            {isNight && <StarryBackground starCount={50} />}

            {/* Sol */}
            <View
                className='absolute bottom-0 -left-52 border-4 h-36 rounded-t-full w-[100%] z-0'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
            />
            <View
                className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-10'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
            />

            {/* Chien */}
            {!isNight && (
            <Animated.View
                style={{
                    transform: [{ translateX }],
                    position: 'absolute',
                    bottom: 10,
                    alignSelf: 'center',
                }}
            >
                <LottieView
                    ref={animationRef}
                    source={require('../../assets/animations/dog.json')}
                    autoPlay
                    loop={true}
                    style={{ width: 200, height: 200 }}
                />
            </Animated.View>
            )}
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
    );
}
