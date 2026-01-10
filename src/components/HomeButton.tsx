import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { BlurView } from 'expo-blur';

type HomeButtonProps = {
  title: string;
  icon?: React.ReactNode;
  description: string;
  onPress: (event: GestureResponderEvent) => void;
  isNight: boolean;
  style?: string;
};

export default function HomeButton({ onPress, title, description, icon, isNight, style }: HomeButtonProps) {
  const iconColor = isNight ? "rgba(255, 255, 255, 0.8)" : "rgb(71, 85, 105)"; // white/80 ou slate-600

  return (
    <TouchableOpacity
      onPress={onPress}
      className={` ${style === "half" ? "w-1/2 flex-1" : "w-full"} rounded-3xl overflow-hidden z-10`}
    >
      <BlurView
        intensity={50}
        tint="light"
        className="p-4 flex-col justify-between items-center"
      >
        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-lg font-baloo-semibold self-start`}>{title}</Text>
        <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-base font-baloo self-start`}>{description}</Text>
        {icon && (
          <View className="self-end">
            {React.isValidElement(icon)
              ? React.cloneElement(icon, { color: iconColor } as any)
              : icon
            }
          </View>
        )}
      </BlurView>
    </TouchableOpacity>
  );
}
