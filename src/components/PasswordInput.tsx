import { useState } from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';

type PasswordInputProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'secureTextEntry'> & {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export default function PasswordInput({ value, onChangeText, className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="relative">
      <TextInput
        {...props}
        className={className}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        textContentType="password"
        style={[{ fontFamily: showPassword ? undefined : 'System' }, props.style]}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        className="absolute right-4 top-4"
        onPress={() => setShowPassword(!showPassword)}
      >
        <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}
