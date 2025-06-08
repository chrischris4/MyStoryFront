import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BottomNavBar() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View
      className=" absolute bottom-2 left-2 right-2 h-20 bg-[#0D1821] flex flex-row justify-around items-center rounded-xl shadow-md z-10"
    >
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text className="text-white font-semibold">Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Stories')}>
        <Text className="text-white font-semibold">Stories</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CreateStory')}>
        <Text className="text-white font-semibold">Create</Text>
      </TouchableOpacity>
    </View>
  );
}
