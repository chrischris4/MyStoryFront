import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const registerSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('auth.emailInvalid'))
      .required(t('auth.emailRequired')),
    password: Yup.string()
      .min(6, t('auth.passwordMinLength'))
      .required(t('auth.passwordRequired')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('auth.passwordMismatch'))
      .required(t('auth.confirmPasswordRequired')),
  });

  const handleRegister = async (
    values: { email: string; password: string },
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
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

  return (
    <View className="flex-1 justify-center items-center bg-[#87CEEB] px-6">
      <View className="w-[140%] flex flex-col justify-center items-center aspect-square rounded-full bg-white">
        <View className='w-[70%]'>
          <Text className="text-2xl font-baloo-bold mb-4 text-gray-800 text-center">{t('auth.register')}</Text>

          <Formik
            initialValues={{ email: '', password: '', confirmPassword: '' }}
            validationSchema={registerSchema}
            onSubmit={handleRegister}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <>
                <View className="mb-4">
                  <TextInput
                    className={`w-full border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder={t('auth.email')}
                    keyboardType="email-address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{errors.email}</Text>
                  )}
                </View>

                <View className="mb-4">
                  <TextInput
                    className={`w-full border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder={t('auth.password')}
                    secureTextEntry
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                  />
                  {touched.password && errors.password && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{errors.password}</Text>
                  )}
                </View>

                <View className="mb-4">
                  <TextInput
                    className={`w-full border ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder={t('auth.confirmPassword')}
                    secureTextEntry
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{errors.confirmPassword}</Text>
                  )}
                </View>

                <TouchableOpacity
                  className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#38b6ff]'} rounded-xl py-4 w-full mb-4`}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  <Text className="text-white text-lg font-baloo-semibold text-center">
                    {isSubmitting ? t('auth.registering') : t('auth.registerButton')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="text-[#38b6ff] text-center font-baloo">{t('auth.hasAccount')}</Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </View>
    </View >
  );
}
