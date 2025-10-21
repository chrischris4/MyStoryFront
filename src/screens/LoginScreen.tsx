import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      const res = await fetch('http://192.168.1.95:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        Alert.alert('Erreur', errorData.message || 'Erreur lors de la connexion');
        return;
      }

      const data = await res.json();
      const accessToken = data.accessToken;

      await AsyncStorage.setItem('accessToken', accessToken);

      Alert.alert('Succès', 'Connexion réussie !');
      navigation.navigate('Home');

    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
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
          >
            <Text className="text-white font-semibold text-center">Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-[#38b6ff] text-center">Pas encore de compte ? S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
