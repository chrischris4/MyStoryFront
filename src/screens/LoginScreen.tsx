import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';
import { useAuth } from '~/context/AuthContext';
import { api, ApiError } from '~/services/api';
import { Formik } from 'formik';
import * as Yup from 'yup';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
});

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);

    try {
      const data = await api.login(values.email, values.password);

      console.log('Login response:', data);

      // Connexion via le contexte d'authentification
      // Le contexte va automatiquement récupérer le profil utilisateur
      // et attendre que tout soit chargé avant de résoudre la Promise
      await login(data.accessToken);

      console.log('Login completed, user loaded, navigating to MainTabs');

      // Maintenant on peut naviguer car l'utilisateur est bien chargé
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      );

    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Erreur', error.message || 'Erreur lors de la connexion');
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#87CEEB] px-6">
      <View className="w-[140%] flex flex-col justify-center items-center aspect-square rounded-full bg-white">
        <View className='w-[70%]'>
          <Text className="font-bold text-xl mb-4 text-center text-gray-800">Connexion</Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                <View className="mb-4">
                  <TextInput
                    className={`w-full border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder="Email"
                    keyboardType="email-address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{errors.email}</Text>
                  )}
                </View>

                <View className="mb-6">
                  <TextInput
                    className={`w-full border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder="Mot de passe"
                    secureTextEntry
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                  />
                  {touched.password && errors.password && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{errors.password}</Text>
                  )}
                </View>

                <TouchableOpacity
                  className="bg-[#38b6ff] rounded-xl py-4 w-full mb-4"
                  onPress={() => handleSubmit()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold text-center">Se connecter</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text className="text-[#38b6ff] text-center">Pas encore de compte ? S'inscrire</Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </View>
    </View>
  );
}
