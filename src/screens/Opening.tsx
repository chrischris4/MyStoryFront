import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, Animated } from 'react-native';
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
        <View className="flex-1 relative justify-center items-center bg-[#38b6ff] px-6">
            <Image
                source={{ uri: "https://res.cloudinary.com/dnotl9a0s/image/upload/v1760456926/Flun_1_nniixk.png" }}
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
                    source={require('../../assets/animations/Loading.json')}
                    autoPlay
                    loop={true}
                    style={{ width: 200, height: 200 }}
                />
            </Animated.View>
        </View>
    );
}
