import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { useOAuth } from '~/hooks/useOAuth';
import { api } from '~/services/api';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithGoogle, isLoading: isOAuthLoading, loadingProvider } = useOAuth();
  const welcomeMessages = t('welcome.messages', { returnObjects: true }) as string[];

  const registerSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('auth.emailInvalid'))
      .required(t('auth.emailRequired')),
    password: Yup.string()
      .min(6, t('auth.passwordMinLength'))
      .required(t('auth.passwordRequired')),
  });

  const handleRegister = async (
    values: { email: string; password: string },
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email.toLowerCase(), password: values.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Gestion des erreurs spécifiques du backend
        if (res.status === 409) {
          // Conflit - email ou nom déjà utilisé
          if (data.message?.includes('email')) {
            setFieldError('email', data.message || t('auth.emailAlreadyUsed'));
          } else {
            // Erreur générique pour les conflits
            setFieldError('email', data.message || t('auth.registerError'));
          }
        } else {
          // Autres erreurs
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: data.message || t('auth.registerError'),
          });
        }
        setSubmitting(false);
        return;
      }

      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('auth.accountCreated'),
        props: { emoji: '🎉' },
      });
      navigation.navigate('CompleteProfileScreen', { accessToken, refreshToken });

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.networkError'),
      });
      setSubmitting(false);
    }
  };

  const handleOAuthSuccess = async () => {
    try {
      const userData = await api.getProfile();
      const userName = userData?.profil?.name || 'toi';
      const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

      Toast.show({
        type: 'info',
        text1: t('welcome.greeting', { name: userName }),
        text2: randomMessage,
        props: { emoji: '👋' },
      });
    } catch {
      // Ignore si on ne peut pas récupérer le profil
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  };

  const handleGoogleLogin = async () => {
    const success = await signInWithGoogle();
    if (success) {
      await handleOAuthSuccess();
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#87CEEB] px-6">
      <View className="w-[160%] md:w-[90%] flex flex-col justify-center items-center aspect-square rounded-full bg-white">
        <View className='w-[60%]'>
          <Text className="text-2xl md:text-3xl font-baloo-bold mb-4 text-gray-800 text-center">{t('auth.register')}</Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={registerSchema}
            onSubmit={handleRegister}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <>
                <View className="mb-4">
                  <Text className="text-gray-700 md:text-lg font-baloo-medium mb-1 ml-1">{t('auth.email')}</Text>
                  <TextInput
                    className={`w-full border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor="#6B7280"
                    keyboardType="email-address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 text-sm md:text-base mt-1 ml-2">{errors.email}</Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 md:text-lg font-baloo-medium mb-1 ml-1">{t('auth.password')}</Text>
                  <View className="relative">
                    <TextInput
                      className={`w-full border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4 pr-12`}
                      placeholder={t('auth.passwordPlaceholder')}
                      placeholderTextColor="#6B7280"
                      secureTextEntry={!showPassword}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-4"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text className="text-red-500 text-sm md:text-base mt-1 ml-2">{errors.password}</Text>
                  )}
                </View>

                <TouchableOpacity
                  className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#38b6ff]'} rounded-xl w-full mb-4 h-14 justify-center items-center`}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  <Text className="text-white text-lg md:text-xl font-baloo-semibold text-center">
                    {isSubmitting ?
                      <LottieView
                        source={require('../../assets/animations/LoadingWhite.json')}
                        autoPlay
                        loop={true}
                        style={{ width: 100, height: 100 }}
                      />
                      : t('auth.registerButton')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="text-[#38b6ff] md:text-lg text-center font-baloo">{t('auth.hasAccount')}</Text>
                </TouchableOpacity>

                {/* Séparateur */}
                <View className="flex-row items-center my-4">
                  <View className="flex-1 h-[1px] bg-gray-300" />
                  <Text className="mx-4 text-gray-500 md:text-lg font-baloo">{t('auth.or')}</Text>
                  <View className="flex-1 h-[1px] bg-gray-300" />
                </View>

                {/* Boutons OAuth */}
                <View className="flex-row gap-3 justify-center">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-white border border-gray-300 rounded-xl h-12 gap-2"
                    onPress={handleGoogleLogin}
                    disabled={isOAuthLoading}
                  >
                    {loadingProvider === 'google' ? (
                      <LottieView
                        source={require('../../assets/animations/LoadingWhite.json')}
                        autoPlay
                        loop={true}
                        style={{ width: 100, height: 100 }}
                      />
                    ) : (
                      <>
                        <FontAwesome name="google" size={20} color="#4285F4" />
                        <Text className="font-baloo-medium md:text-lg text-gray-700">Google</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </View>
      </View>
    </View >
  );
}
