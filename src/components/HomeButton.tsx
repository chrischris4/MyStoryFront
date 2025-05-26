import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';

type HomeButtonProps = {
  title: string;
  icon?: React.ReactNode;
  description: string;
  onPress: (event: GestureResponderEvent) => void;
};

export default function HomeButton({ onPress, title, description, icon }: HomeButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#B4CDED] p-4 rounded-3xl w-full flex-col justify-between items-center"
    >
      <Text className="color-slate-700 text-lg font-semibold flex self-start ">{title}</Text>
      <Text className="color-slate-600 text-sm font-light flex self-start ">{description}</Text>
      {icon && <View className="self-end">{icon}</View>}
    </TouchableOpacity>
  );
}
