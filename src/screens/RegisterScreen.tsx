import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';

const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
});

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleRegister = async (values: { email: string; password: string }) => {
    try {
      const res = await fetch('http://192.168.1.95:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        Alert.alert('Erreur', errorData.message || 'Erreur lors de l\'inscription');
        return;
      }

      const data = await res.json();
      const accessToken = data.accessToken;

      await AsyncStorage.setItem('accessToken', accessToken);

      Alert.alert('Succès', 'Compte créé avec succès !');

      navigation.navigate('CompleteProfileScreen', { accessToken });

    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#87CEEB] px-6">
      <View className="w-[140%] flex flex-col justify-center items-center aspect-square rounded-full bg-white">
        <View className='w-[70%]'>
          <Text className="text-xl font-bold mb-4 text-gray-800 text-center">Inscription</Text>

          <Formik
            initialValues={{ email: '', password: '', confirmPassword: '' }}
            validationSchema={registerSchema}
            onSubmit={handleRegister}
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

                <View className="mb-4">
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

                <View className="mb-4">
                  <TextInput
                    className={`w-full border ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-xl p-4`}
                    placeholder="Confirmez le mot de passe"
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
                  className="bg-[#38b6ff] rounded-xl py-4 w-full mb-4"
                  onPress={() => handleSubmit()}
                >
                  <Text className="text-white font-semibold text-center">S'inscrire</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="text-[#38b6ff] text-center">Déjà un compte ? Se connecter</Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </View>
    </View >
  );
}
