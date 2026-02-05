import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

type ShopButtonProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  price: string;
  onPress: (event: GestureResponderEvent) => void;
  isCoin?: boolean;
  isNight: boolean;
  amount?: number;
};

export default function ShopButton({ onPress, title, price, icon, isNight, description, amount, isCoin = false }: ShopButtonProps) {

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={` ${isCoin ? "h-24" : "h-44"} rounded-xl w-full mt-2`}
      style={{ overflow: 'hidden' }}
    >
      <BlurView
        intensity={50}
        tint={isNight ? "dark" : "light"}
        className="flex flex-col w-full p-2 h-full relative"
        style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
      >
        <View className='flex flex-col flex-1'>
          <Text className={`${isNight ? "text-white" : "text-slate-900"} text-lg font-baloo-semibold`}>{title}</Text>
          {amount && (
            <Text className={`${isNight ? "text-white" : "text-slate-900"} text-4xl pt-1 font-baloo-medium`}>{amount}</Text>
          )}
          {description && (
            <Text className={`${isNight ? "text-white/70" : "text-slate-700"} text-sm font-baloo-medium mt-1`}>{description}</Text>
          )}
          {!isCoin && (
            <View className="flex-row justify-end items-center gap-1 mt-2">
              <Text className={`${isNight ? "text-white" : "text-slate-600"} text-xs font-baloo underline`}>Plus de détails</Text>
              <Feather name="arrow-right" size={10} color={isNight ? "rgba(255,255,255,0.5)" : "#64748b"} className='mb-1' />
            </View>
          )}
        </View>
        <Text className={`${isNight ? "text-white/80" : "text-slate-900"} text-sm font-baloo self-end absolute bottom-2 right-2`}>{price}</Text>
        {icon && <View style={{ alignSelf: 'flex-end' }}>{icon}</View>}
      </BlurView>
    </TouchableOpacity>
  );
}
