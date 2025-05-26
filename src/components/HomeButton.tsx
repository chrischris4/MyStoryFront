import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';

type HomeButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
};

export default function HomeButton({ onPress, title }: HomeButtonProps) {  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-blue-200 p-4 rounded-xl w-full flex-col justify-between items-center"
    >
      <Text className="color-slate-700 text-lg font-semibold flex self-start mb-6">{title}</Text>
      <Text className="color-slate-700 text-3xl font-bold flex self-end">+</Text>
    </TouchableOpacity>
  );
}
