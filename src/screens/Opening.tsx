import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
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
                            source={{ uri: "https://res.cloudinary.com/dnotl9a0s/image/upload/v1760456926/Flun_1_nniixk.png"}}
                            style={{
                              width: 300,
                              height: 300,
                            }}
                          />
            <ActivityIndicator
                size="large"
                color="#ffffff"
                style={{
                    position: 'absolute',
                    bottom: 60,
                }}
            />

        </View>
    );
}
