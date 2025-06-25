import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';

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
      className="bg-[#edb4cb] p-4 rounded-3xl w-1/3 flex-col justify-between items-center"
    >
      <Text className="color-slate-700 text-lg font-semibold flex self-start ">{title}</Text>
      <Text className="color-slate-600 text-sm font-light flex self-start ">{price}</Text>
      {icon && <View className="self-end">{icon}</View>}
    </TouchableOpacity>
  );
}
