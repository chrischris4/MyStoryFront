import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import React, { useEffect } from 'react';
import { View, Image, Animated } from 'react-native';
import { RootStackParamList } from '~/navigation/AppNavigator';

export default function OpeningScreen() {
    type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Login'); // redirige après 3 secondes
        }, 3000);

        return () => clearTimeout(timer); // cleanup si le composant se démonte
    }, []);


    return (
        <View className="flex-1 relative justify-center items-center bg-[#5FD5FF] px-6">
            <Image
                source={require('../../assets/splash.png')}
                style={{
                    width: 300,
                    height: 300,
                }}
            />
            <Animated.View
                style={{
                    alignSelf: 'center',
                }}
            >
                <LottieView
                    source={require('../../assets/animations/LoadingWhite.json')}
                    autoPlay
                    loop={true}
                    style={{ width: 150, height: 150 }}
                />
            </Animated.View>
        </View>
    );
}
