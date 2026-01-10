import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { BlurView } from 'expo-blur';

type ShopButtonProps = {
  title: string;
  icon?: React.ReactNode;
  price: string;
  onPress: (event: GestureResponderEvent) => void;
  isCoin?: boolean;
  isNight: boolean;
};

export default function ShopButton({ onPress, title, price, icon, isNight, isCoin = false }: ShopButtonProps) {
  const size = isCoin ? 90 : 110;

  return (
    <TouchableOpacity
      onPress={onPress}
      className='rounded-full'
      style={{ width: size, height: size, overflow: 'hidden' }}
    >
      <BlurView
        intensity={50}
        tint="light"
        className='flex items-center justify-center'
        style={{ flex: 1, flexDirection: 'column' }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }} className={`${isNight ? "text-white" : "text-slate-600"}`}>{title}</Text>
        <Text style={{ fontSize: 14, fontWeight: '300', textAlign: 'center' }} className={`${isNight ? "text-white/80" : "text-slate-600"}`}>{price}</Text>
        {icon && <View style={{ alignSelf: 'flex-end' }}>{icon}</View>}
      </BlurView>
    </TouchableOpacity>
  );
}
