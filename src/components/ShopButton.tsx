import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { BlurView } from 'expo-blur';

type ShopButtonProps = {
  title: string;
  value?: string;
  icon?: React.ReactNode;
  price: string;
  onPress: (event: GestureResponderEvent) => void;
  isCoin?: boolean;
  isNight: boolean;
  amount?: number;
  value2?: string;
};

export default function ShopButton({ onPress, title, price, icon, isNight, value, value2, amount, isCoin = false }: ShopButtonProps) {

  return (
    <TouchableOpacity
      onPress={onPress}
      className='rounded-xl w-full mt-2 aspect-square'
      style={{ overflow: 'hidden' }}
    >
      <BlurView
        intensity={50}
        tint={isNight ? "dark" : "light"}
        className="flex flex-col w-full p-2 h-full relative"
        style={{backgroundColor: isNight ? '#1e293b90' : '' }}
      >
        <View className='flex flex-col'>
          <Text className={`${isNight ? "text-white" : "text-slate-900"} text-lg font-baloo-semibold`}>{title}</Text>
          {amount && (
            <Text className={`${isNight ? "text-white" : "text-slate-900"} text-4xl pt-1 font-baloo-medium`}>{amount}</Text>
          )}
          {value && (
            <Text className={`${isNight ? "text-white" : "text-slate-900"} text-sm font-baloo-medium`}>{value}</Text>
          )}
          {value2 && (
            <Text className={`${isNight ? "text-white" : "text-slate-900"} text-sm font-baloo-medium`}>{value2}</Text>
          )}
        </View>
        <Text className={`${isNight ? "text-white/80" : "text-slate-900"} text-sm font-baloo self-end absolute bottom-2 right-2`}>{price}</Text>
        {icon && <View style={{ alignSelf: 'flex-end' }}>{icon}</View>}
      </BlurView>
    </TouchableOpacity>
  );
}
