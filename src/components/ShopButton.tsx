import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { BlurView } from 'expo-blur';

type ShopButtonProps = {
  title: string;
  icon?: React.ReactNode;
  price: string;
  onPress: (event: GestureResponderEvent) => void;
};

export default function ShopButton({ onPress, title, price, icon }: ShopButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-1/2 flex-1 rounded-2xl overflow-hidden"
    >
      <BlurView
        intensity={50}
        tint="light"
        className="p-4 rounded-2xl flex-col justify-between"
      >
        <Text className="text-lg font-semibold mb-1">{title}</Text>
        <Text className="text-sm font-light text-center mb-2">{price}</Text>
        {icon && <View className="self-end">{icon}</View>}
      </BlurView>
    </TouchableOpacity>
  );
}
