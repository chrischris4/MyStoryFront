import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';
import { useAuth } from '~/context/AuthContext';
import { api, ApiError } from '~/services/api';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
});

const WELCOME_MESSAGES = [
  "Plein d'aventures t'attendent ici !",
  "Prêt à créer de nouvelles histoires ?",
  "Tes histoires n'attendent que toi !",
  "L'aventure commence maintenant !",
  "Bienvenue dans le monde des histoires !",
];

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);

    try {
      const data = await api.login(values.email, values.password);

      // Connexion via le contexte d'authentification
      await login(data.accessToken, data.refreshToken);

      // Récupérer les infos utilisateur depuis l'API pour le toast
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/profile/me`, {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const userName = userData?.profil?.name || 'toi';
        const randomMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];

        Toast.show({
          type: 'success',
          text1: `Hey ${userName} !`,
          text2: randomMessage,
        });
      }

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      );

    } catch (error) {
      if (error instanceof ApiError) {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: error.message || 'Erreur lors de la connexion',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Une erreur est survenue',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearStorage = async () => {
    try {
      await AsyncStorage.clear();
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Le storage a été nettoyé !',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de nettoyer le storage',
      });
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#87CEEB] px-6">
      {/* Bouton Debug - Clear Storage */}
      <TouchableOpacity
        onPress={handleClearStorage}
        className="absolute top-12 right-4 bg-red-500 px-4 py-2 rounded-lg z-50"
      >
        <Text className="text-white font-baloo-bold text-xs">Clear Storage</Text>
      </TouchableOpacity>

      <View className="w-[140%] flex flex-col justify-center items-center aspect-square rounded-full bg-white">
        <View className='w-[70%]'>
          <Text className="font-baloo-bold text-2xl mb-4 text-center text-gray-800">Connexion</Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleSubmit, values, errors, touched, setTouched }) => (
              <>
                <View className="mb-4">
                  <TextInput
                    className={`w-full border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder="Email"
                    keyboardType="email-address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{errors.email}</Text>
                  )}
                </View>

                <View className="mb-4">
                  <TextInput
                    className={`w-full border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder="Mot de passe"
                    secureTextEntry
                    value={values.password}
                    onChangeText={handleChange('password')}
                  />
                  {touched.password && errors.password && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{errors.password}</Text>
                  )}
                </View>

                <TouchableOpacity
                  className="bg-[#38b6ff] rounded-xl py-4 w-full mb-4"
                  onPress={() => {
                    setTouched({ email: true, password: true });
                    handleSubmit();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-lg font-baloo-semibold text-center">Se connecter</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text className="text-[#38b6ff] text-center font-baloo">Pas encore de compte ? S'inscrire</Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </View>
    </View>
  );
}
