import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSound } from '~/context/SoundContext';
import * as Haptics from 'expo-haptics';

type HomeButtonProps = {
  title: string;
  icon?: React.ReactNode;
  description: string;
  onPress: (event: GestureResponderEvent) => void;
  isNight: boolean;
  style?: string;
};

export default function HomeButton({ onPress, title, description, icon, isNight, style }: HomeButtonProps) {
  const iconColor = isNight ? "rgba(255, 255, 255, 0.8)" : "rgb(71, 85, 105)";
  const { playSound } = useSound();
  const { width } = useWindowDimensions();
  const isMd = width >= 768;

  const handlePress = (event: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playSound('click');
    onPress(event);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      className={` ${style === "half" ? "w-1/2 flex-1" : "w-full"} rounded-3xl overflow-hidden z-10 md:h-full`}
    >
      <BlurView
        intensity={90}
        tint={isNight ? "dark" : "light"}
        style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10', ...(isMd && { height: 160 }) }}
        className="p-4 md:p-6 flex-col justify-between"
      >
        <View className='flex flex-col'>
        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-lg md:text-3xl font-baloo-semibold self-start`}>{title}</Text>
        <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-base md:text-xl font-baloo self-start`}>{description}</Text>
        </View>
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
