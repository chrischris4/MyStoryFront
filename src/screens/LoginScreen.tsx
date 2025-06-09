import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    // À remplacer avec ta logique réelle
    if (email && password) {
      navigation.navigate('Home');
    } else {
      alert('Veuillez remplir tous les champs');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="font-bold text-xl mb-2 text-gray-800 text-start">Connexion</Text>

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
        className="bg-blue-600 rounded-xl py-4 w-full mb-4"
        onPress={handleLogin}
      >
        <Text className="text-white font-semibold text-center">Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text className="text-blue-600">Pas encore de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}
