import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import PlatformBlur from '~/components/PlatformBlur';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={` ${isCoin ? "h-24 md:h-36" : "h-44 md:h-56"} rounded-xl w-full mt-2`}
      style={{ overflow: 'hidden' }}
    >
      <PlatformBlur
        intensity={90}
        tint={isNight ? "dark" : "light"}
        className="flex flex-col w-full p-2 md:p-4 h-full relative"
        style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
      >
        <View className='flex flex-col flex-1'>
          <Text className={`${isNight ? "text-white" : "text-slate-900"} text-lg md:text-2xl font-baloo-semibold`}>{title}</Text>
          {amount && (
            <Text className={`${isNight ? "text-white" : "text-slate-900"} text-4xl md:text-5xl pt-1 md:pt-3 font-baloo-medium`}>{amount}</Text>
          )}
          {description && (
            <Text className={`${isNight ? "text-white/70" : "text-slate-700"} text-sm md:text-lg font-baloo-medium mt-1`}>{description}</Text>
          )}
          {!isCoin && (
            <View className="flex-row justify-end items-center gap-1 mt-2">
              <Text className={`${isNight ? "text-white" : "text-slate-600"} text-xs md:text-base font-baloo underline`}>{t('billing.moreDetails')}</Text>
              <Feather name="arrow-right" size={10} color={isNight ? "rgba(255,255,255,0.5)" : "#64748b"} className='mb-1 md:mb-0' />
            </View>
          )}
        </View>
        <Text className={`${isNight ? "text-white/80" : "text-slate-900"} text-sm md:text-base font-baloo self-end absolute bottom-2 right-2`}>{price}</Text>
        {icon && <View style={{ alignSelf: 'flex-end' }}>{icon}</View>}
      </PlatformBlur>
    </TouchableOpacity>
  );
}
