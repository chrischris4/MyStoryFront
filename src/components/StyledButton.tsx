import { TouchableOpacity, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import React from 'react';

type StyledButtonProps = {
  title: string;
  icon?: React.ReactNode;
  onPress?: () => void;
};

const StyledButton = ({ title, icon, onPress }: StyledButtonProps) => (
  <TouchableOpacity onPress={onPress} className="w-1/2 flex-1 rounded-3xl overflow-hidden">
    <BlurView intensity={30} tint="light" className="p-4 flex-col">
      <Text className="text-slate-800 font-bold text-start mb-4">{title}</Text>
      {icon && <View className="self-end ">{icon}</View>}
    </BlurView>
  </TouchableOpacity>
);

export default StyledButton;
