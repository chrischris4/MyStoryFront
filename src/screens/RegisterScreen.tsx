import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      alert('Tous les champs sont requis');
      return;
    }

    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    // Inscription fictive
    alert('Compte créé avec succès !');
    navigation.navigate('Login');
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-3xl font-bold mb-8 text-gray-800">Inscription</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-xl p-4 mb-4"
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="w-full border border-gray-300 rounded-xl p-4 mb-4"
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        className="w-full border border-gray-300 rounded-xl p-4 mb-6"
        placeholder="Confirmez le mot de passe"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        className="bg-green-600 rounded-xl py-4 w-full mb-4"
        onPress={handleRegister}
      >
        <Text className="text-white font-semibold text-center">S'inscrire</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text className="text-blue-600">Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}
