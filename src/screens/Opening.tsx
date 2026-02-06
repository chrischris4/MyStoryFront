import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import React, { useEffect } from 'react';
import { View, Image, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '~/navigation/AppNavigator';
import { useAuth } from '~/context/AuthContext';

export default function OpeningScreen() {
    type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

    const navigation = useNavigation<NavigationProp>();
    const { isAuthenticated, isLoading, user } = useAuth();
    const { t } = useTranslation();

    useEffect(() => {
        if (isLoading) return;

        const timer = setTimeout(() => {
            if (isAuthenticated) {
                const userName = user?.profil?.name || 'toi';
                const welcomeMessages = t('welcome.messages', { returnObjects: true }) as string[];
                const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

                Toast.show({
                    type: 'success',
                    text1: t('welcome.greeting', { name: userName }),
                    text2: randomMessage,
                });

                navigation.replace('MainTabs');
            } else {
                navigation.replace('Login');
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [isLoading, isAuthenticated]);


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
