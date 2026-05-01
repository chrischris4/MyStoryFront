import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';
import { useAuth } from '~/context/AuthContext';
import { api } from '~/services/api';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { mapApiError } from '~/utils/errorMapper';
import LottieView from 'lottie-react-native';
import { useOAuth } from '~/hooks/useOAuth';
import PasswordInput from '~/components/PasswordInput';

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
  const { signInWithGoogle, isLoading: isOAuthLoading, loadingProvider } = useOAuth();

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);

    try {
      const data = await api.login(values.email.toLowerCase(), values.password);

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
          type: 'info',
          text1: t('welcome.greeting', { name: userName }),
          text2: randomMessage,
          props: { emoji: '👋' },
        });
      }

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      );

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: mapApiError(error, t),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSuccess = async () => {
    // Récupérer les infos utilisateur pour le toast
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
    const result = await signInWithGoogle();
    if (!result.success) return;
    if (result.isNewUser) {
      navigation.navigate('CompleteProfileScreen', { accessToken: result.accessToken, refreshToken: result.refreshToken });
    } else {
      await handleOAuthSuccess();
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#87CEEB] px-6">
      <View className="w-[160%] md:w-[90%] flex flex-col justify-center items-center aspect-square rounded-full bg-white">
        <View className='w-[60%]'>
          <Text className="font-baloo-bold text-2xl md:text-3xl mb-4 text-center text-gray-800">{t('auth.login')}</Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
            validateOnBlur={false}
            validateOnChange={false}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setTouched }) => (
              <>
                <View className="mb-4">
                  <Text className="text-gray-700 md:text-lg font-baloo-medium mb-1 ml-1">{t('auth.email')}</Text>
                  <TextInput
                    className={`w-full border border-gray-300 rounded-xl p-4`}
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor="#6B7280"
                    keyboardType="email-address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 font-baloo text-sm md:text-base mt-1 ml-2">{errors.email}</Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 md:text-lg font-baloo-medium mb-1 ml-1">{t('auth.password')}</Text>
                  <PasswordInput
                    className="w-full border border-gray-300 rounded-xl p-4 pr-12"
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor="#6B7280"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                  />
                  {touched.password && errors.password && (
                    <Text className="text-red-500 font-baloo text-sm md:text-base mt-1 ml-2">{errors.password}</Text>
                  )}
                </View>

                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ForgotPassword')} className="self-end mb-4">
                  <Text className="text-[#38b6ff] font-baloo text-sm md:text-base">{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#38b6ff] rounded-xl h-14 flex justify-center items-center w-full mb-4"
                  onPress={() => {
                    setTouched({ email: true, password: true });
                    handleSubmit();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LottieView
                      source={require('../../assets/animations/LoadingWhite.json')}
                      autoPlay
                      loop={true}
                      style={{ width: 100, height: 100 }}
                    />) : (
                    <Text className="text-white text-lg md:text-xl font-baloo-semibold text-center">{t('auth.loginButton')}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Register')}>
                  <Text className="text-[#38b6ff] md:text-lg text-center font-baloo">{t('auth.noAccount')}</Text>
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
                    activeOpacity={0.8}
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
                      />) : (
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
    </View>
  );
}
