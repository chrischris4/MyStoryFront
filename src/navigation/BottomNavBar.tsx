import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BottomNavBar() {
  const navigation = useNavigation();

  return (
    <View
      className=" absolute bottom-2 left-2 right-2 h-12 bg-red-400 flex flex-row justify-around items-center rounded-xl shadow-md"
    >
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text className="text-gray-700 font-semibold">Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Stories')}>
        <Text className="text-gray-700 font-semibold">Stories</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CreateStory')}>
        <Text className="text-gray-700 font-semibold">Create</Text>
      </TouchableOpacity>
    </View>
  );
}
