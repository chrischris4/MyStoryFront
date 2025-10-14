import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons'; // 👈 import des icônes Expo

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BottomNavBar() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="absolute bottom-2 left-2 right-2 h-16 flex flex-row justify-around items-center rounded-xl shadow-md z-10">
      <TouchableOpacity onPress={() => navigation.navigate('Home')} className="items-center ">
        <Feather name="home" size={24} color="#E6F9F8" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Stories')} className="items-center">
        <Feather name="book" size={24} color="#E6F9F8" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('CreateStory')} className="items-center">
        <Feather name="plus-circle" size={26} color="#E6F9F8" />
      </TouchableOpacity>
    </View>
  );
}
