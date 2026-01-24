import React, { useState, useMemo } from 'react';
import { View, TextInput, Image, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { RootStackParamList } from '~/types';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteProfileScreen'>;

// Fonction pour générer un username aléatoire
const generateRandomUsername = (): string => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Nombre entre 1000 et 9999
    return `Fluner${randomNumber}`;
};

export default function CompleteProfileScreen({ route, navigation }: Props) {
    const { t } = useTranslation();
    const { accessToken, refreshToken } = route.params;
    const { login } = useAuth();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const defaultUsername = useMemo(() => generateRandomUsername(), []);

    // Schéma de validation Yup
    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .min(3, t('profile.pseudoMinLength'))
            .max(20, t('profile.pseudoMaxLength'))
            .matches(/^[a-zA-Z0-9_-]*$/, t('profile.pseudoInvalidChars'))
            .optional(),
    });

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Toast.show({
                type: 'error',
                text1: t('profile.permissionDenied'),
                text2: t('profile.photoPermissionMessage'),
            });
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

    const handleSubmit = async (values: { name?: string } = { name: '' }, { setSubmitting, setFieldError }: any) => {
        try {

            // Utiliser le username par défaut si aucun n'est fourni
            const finalUsername = (values?.name || '').trim() || defaultUsername;

            const formData = new FormData();
            formData.append('name', finalUsername);

            if (imageUri) {
                const filename = imageUri.split('/').pop() || 'profile.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type,
                } as any);
            }

            const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/profile`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                // Mettre à jour le contexte d'authentification
                // On ne passe pas de userData pour que login() récupère le profil complet depuis /profile/me
                try {
                    await login(accessToken, refreshToken);

                    // Naviguer vers MainTabs en réinitialisant la navigation stack
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }],
                    });
                } catch (loginError) {
                    console.error('Erreur lors de la connexion:', loginError);
                    Toast.show({
                        type: 'error',
                        text1: t('common.error'),
                        text2: t('profile.loginError'),
                    });
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
                        setFieldError('name', data.message || t('profile.pseudoTaken'));
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: t('common.error'),
                            text2: data.message || t('profile.profileUpdateError'),
                        });
                    }
                } else {
                    // Autres erreurs
                    Toast.show({
                        type: 'error',
                        text1: t('common.error'),
                        text2: data.message || t('profile.profileUpdateError'),
                    });
                }
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: t('auth.networkError'),
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-[#87CEEB] px-6">
            <View className="w-[140%] flex flex-col justify-center items-center aspect-square rounded-full bg-white">
                <View className='w-[70%]'>
                    <Text className='font-bold text-xl mb-2 text-center text-gray-800'>{t('profile.completeProfile')}</Text>
                    <Formik
                        initialValues={{ name: '' }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                            <View className='w-full'>
                                <Text className='font-semibold text-base mb-1'>{t('profile.pseudo')}</Text>
                                <Text className='text-gray-500 text-xs mb-2'>
                                    {t('profile.defaultPseudo', { name: defaultUsername })}
                                </Text>
                                <TextInput
                                    className={`w-full border ${touched.name && errors.name ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4 mb-2`}
                                    placeholder={t('profile.pseudoPlaceholder', { name: defaultUsername })}
                                    value={values.name}
                                    onChangeText={handleChange('name')}
                                    onBlur={handleBlur('name')}
                                    autoCapitalize="none"
                                />
                                {touched.name && errors.name && (
                                    <Text className='text-red-500 text-sm mb-2'>{errors.name}</Text>
                                )}

                                <Text className='font-semibold text-base mb-2 mt-2'>{t('profile.profilePicture')}</Text>
                                <TouchableOpacity onPress={pickImage}>
                                    <View className='items-center mb-3'>
                                        {imageUri ? (
                                            <Image
                                                source={{ uri: imageUri }}
                                                className="w-24 h-24 rounded-full"
                                            />
                                        ) : (
                                            <View className="w-24 h-24 rounded-full border-2 border-dashed border-gray-400 justify-center items-center bg-gray-100">
                                                <Text className='text-gray-500 text-xs text-center'>{t('profile.tapToAdd')}</Text>
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
                                        {isSubmitting ? t('profile.sending') : t('profile.continue')}
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
                                        {t('profile.skipStep')}
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

