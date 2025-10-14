import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { BlurView } from 'expo-blur';

type HomeButtonProps = {
  title: string;
  icon?: React.ReactNode;
  description: string;
  onPress: (event: GestureResponderEvent) => void;
  isNight: boolean;
};

export default function HomeButton({ onPress, title, description, icon, isNight }: HomeButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-full rounded-3xl overflow-hidden z-10"
    >
      <BlurView
        intensity={50}
        tint="light"
        className="p-4 flex-col justify-between items-center bg-[#B4CDED]/40"
      >
        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-lg font-semibold self-start`}>{title}</Text>
        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-sm font-light self-start`}>{description}</Text>
        {icon && <View className="self-end mt-2">{icon}</View>}
      </BlurView>
    </TouchableOpacity>
  );
}
