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
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const { t } = useTranslation();

  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('auth.emailInvalid'))
      .required(t('auth.emailRequired')),
    password: Yup.string()
      .min(6, t('auth.passwordMinLength'))
      .required(t('auth.passwordRequired')),
  });

  const welcomeMessages = t('welcome.messages', { returnObjects: true }) as string[];
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
        const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        Toast.show({
          type: 'success',
          text1: t('welcome.greeting', { name: userName }),
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
          text1: t('common.error'),
          text2: error.message || t('auth.loginError'),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('errors.unknownError'),
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
        text1: t('common.success'),
        text2: t('auth.storageCleared'),
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.storageClearError'),
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
        <Text className="text-white font-baloo-bold text-xs">{t('auth.clearStorage')}</Text>
      </TouchableOpacity>

      <View className="w-[140%] flex flex-col justify-center items-center aspect-square rounded-full bg-white">
        <View className='w-[70%]'>
          <Text className="font-baloo-bold text-2xl mb-4 text-center text-gray-800">{t('auth.login')}</Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleSubmit, values, errors, touched, setTouched }) => (
              <>
                <View className="mb-4">
                  <Text className="text-gray-700 font-baloo-medium mb-1 ml-1">{t('auth.email')}</Text>
                  <TextInput
                    className={`w-full border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder={t('auth.emailPlaceholder')}
                    keyboardType="email-address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{errors.email}</Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 font-baloo-medium mb-1 ml-1">{t('auth.password')}</Text>
                  <TextInput
                    className={`w-full border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder={t('auth.passwordPlaceholder')}
                    secureTextEntry
                    value={values.password}
                    onChangeText={handleChange('password')}
                  />
                  {touched.password && errors.password && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{errors.password}</Text>
                  )}
                </View>

                <TouchableOpacity
                  className="bg-[#38b6ff] rounded-xl h-14 flex justify-center items-center w-full mb-4"
                  onPress={() => {
                    setTouched({ email: true, password: true });
                    handleSubmit();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-lg font-baloo-semibold text-center">{t('auth.loginButton')}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text className="text-[#38b6ff] text-center font-baloo">{t('auth.noAccount')}</Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </View>
    </View>
  );
}
