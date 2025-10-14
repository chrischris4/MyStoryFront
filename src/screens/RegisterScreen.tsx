import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const res = await fetch('http://192.168.1.95:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-xl font-bold mb-4 text-gray-800">Inscription</Text>

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
        className="w-full border border-gray-300 rounded-xl p-4 mb-4"
        placeholder="Confirmez le mot de passe"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        className="bg-[#38b6ff] rounded-xl py-4 w-full mb-4"
        onPress={handleRegister}
      >
        <Text className="text-white font-semibold text-center">S'inscrire</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text className="text-[#38b6ff]">Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}
