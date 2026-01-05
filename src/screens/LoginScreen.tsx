import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '~/context/AuthContext';
import { api, ApiError } from '~/services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.login(email, password);

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
                    {/* <Text className="text-sm mb-4 text-center text-gray-800"></Text> */}


          <TextInput
            className="w-full border border-gray-300 rounded-xl p-4 mb-4"
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            className="w-full border border-gray-300 rounded-xl p-4 mb-6"
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            className="bg-[#38b6ff] rounded-xl py-4 w-full mb-4"
            onPress={handleLogin}
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
        </View>
      </View>
    </View>
  );
}
