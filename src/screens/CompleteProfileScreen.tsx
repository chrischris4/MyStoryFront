import React, { useState, useMemo } from 'react';
import { View, TextInput, Image, Text, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { RootStackParamList } from '~/types';
import { useAuth } from '~/context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteProfileScreen'>;

// Schéma de validation Yup
const validationSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Le pseudo doit contenir au moins 3 caractères')
        .max(20, 'Le pseudo ne peut pas dépasser 20 caractères')
        .matches(/^[a-zA-Z0-9_-]*$/, 'Seuls les lettres, chiffres, tirets (-) et underscores (_) sont autorisés')
        .optional(),
});

// Fonction pour générer un username aléatoire
const generateRandomUsername = (): string => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Nombre entre 1000 et 9999
    return `Fluner${randomNumber}`;
};

export default function CompleteProfileScreen({ route, navigation }: Props) {
    const { accessToken } = route.params;
    const { login } = useAuth();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const defaultUsername = useMemo(() => generateRandomUsername(), []);

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

    const handleSubmit = async (values: { name?: string } = { name: '' }, { setSubmitting, setFieldError }: any) => {
        try {
            console.log('handleSubmit called with values:', values);

            // Utiliser le username par défaut si aucun n'est fourni
            const finalUsername = (values?.name || '').trim() || defaultUsername;

            console.log('Final username:', finalUsername);

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
                    name: finalUsername,
                    imageUrl: imageData,
                }),
            });

            const data = await res.json();
            console.log('Response data:', data);

            if (res.ok) {
                // Mettre à jour le contexte d'authentification
                // On ne passe pas de userData pour que login() récupère le profil complet depuis /profile/me
                try {
                    await login(accessToken);

                    // Naviguer vers MainTabs en réinitialisant la navigation stack
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }],
                    });
                } catch (loginError) {
                    console.error('Erreur lors de la connexion:', loginError);
                    Alert.alert('Erreur', 'Erreur lors de la connexion. Veuillez vous reconnecter.');
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                }
            } else {
                // Gestion des erreurs spécifiques du backend
                if (res.status === 409) {
                    // Conflit - nom d'utilisateur déjà pris
                    if (data.message?.includes('nom')) {
                        setFieldError('name', data.message || 'Ce nom d\'utilisateur est déjà pris');
                    } else {
                        Alert.alert('Erreur', data.message || 'Erreur lors de la mise à jour du profil.');
                    }
                } else {
                    // Autres erreurs
                    Alert.alert('Erreur', data.message || 'Erreur lors de la mise à jour du profil.');
                }
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur réseau est survenue.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-[#87CEEB] px-6">
            <View className="w-[140%] flex flex-col justify-center items-center aspect-square rounded-full bg-white">
                <View className='w-[70%]'>
                    <Text className='font-bold text-xl mb-2 text-center text-gray-800'>Complétez votre profil</Text>
                    <Formik
                        initialValues={{ name: '' }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                            <View className='w-full'>
                                <Text className='font-semibold text-base mb-1'>Pseudo</Text>
                                <Text className='text-gray-500 text-xs mb-2'>
                                    Par défaut: {defaultUsername}
                                </Text>
                                <TextInput
                                    className={`w-full border ${touched.name && errors.name ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4 mb-2`}
                                    placeholder={`Ex: ${defaultUsername}`}
                                    value={values.name}
                                    onChangeText={handleChange('name')}
                                    onBlur={handleBlur('name')}
                                    autoCapitalize="none"
                                />
                                {touched.name && errors.name && (
                                    <Text className='text-red-500 text-sm mb-2'>{errors.name}</Text>
                                )}

                                <Text className='font-semibold text-base mb-2 mt-2'>Photo de profil</Text>
                                <TouchableOpacity onPress={pickImage}>
                                    <View className='items-center mb-3'>
                                        {imageUri ? (
                                            <Image
                                                source={{ uri: imageUri }}
                                                className="w-24 h-24 rounded-full"
                                            />
                                        ) : (
                                            <View className="w-24 h-24 rounded-full border-2 border-dashed border-gray-400 justify-center items-center bg-gray-100">
                                                <Text className='text-gray-500 text-xs text-center'>Toucher pour{'\n'}ajouter</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`w-full rounded-xl py-4 items-center mb-2 ${isSubmitting ? 'bg-gray-400' : 'bg-[#38b6ff]'}`}
                                    onPress={() => handleSubmit()}
                                    disabled={isSubmitting}
                                >
                                    <Text className='text-white font-semibold text-center'>
                                        {isSubmitting ? 'Envoi...' : 'Continuer'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className='w-full rounded-xl py-3 items-center'
                                    onPress={() => {
                                        // Soumettre avec une valeur vide pour utiliser le username par défaut
                                        handleSubmit();
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <Text className='text-[#38b6ff] text-center'>
                                        Passer cette étape
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </View>
    );
}

