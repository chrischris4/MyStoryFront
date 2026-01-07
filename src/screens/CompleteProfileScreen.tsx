import React, { useState } from 'react';
import { View, TextInput, Button, Image, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    Stories: undefined;
    CreateStory: undefined;
    StoryDetail: undefined;
    CompleteProfileScreen: { accessToken: string }; // Ici, accessToken est requis
};

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteProfileScreen'>;

export default function CompleteProfileScreen({ route, navigation }: Props) {
    const { accessToken } = route.params;

    const [name, setName] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à vos photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const convertToBase64 = async (uri: string): Promise<string> => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Le pseudo est requis.');
            return;
        }

        setLoading(true);
        try {
            let imageData: string | null = null;
            if (imageUri) {
                imageData = await convertToBase64(imageUri);
            }

            const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/profile`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    imageUrl: imageData,
                }),
            });

            if (res.ok) {
                Alert.alert('Succès', 'Profil mis à jour avec succès.');
                navigation.navigate('MainTabs'); // Rediriger vers MainTabs après MAJ
            } else {
                const error = await res.json();
                Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour du profil.');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className='flex-1 justify-center items-center px-6'>
            <Text className='font-bold text-xl mb-4'>Choisissez un pseudo </Text>
            <TextInput
                className="w-full border border-gray-300 rounded-xl p-4 mb-4"
                placeholder="Pseudo"
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
            />
            <Text className='font-bold text-xl mb-4'>Choisissez une image </Text>
            <Button title="Parcourir" onPress={pickImage} />
            {imageUri ? (
                <Image
                    source={{ uri: imageUri }}
                    className="w-32 h-32 rounded-full my-4"
                />
            ) : (
                <View className="w-32 h-32 rounded-full border border-gray-400 my-4" />
            )}            <Button title={loading ? 'Envoi...' : 'Valider'} onPress={handleSubmit} disabled={loading} />
        </View>
    );
}

