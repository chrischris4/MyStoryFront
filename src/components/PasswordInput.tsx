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

  const handleChange = (input: string) => {
    if (showPassword) {
      onChangeText(input);
      return;
    }
    const prevLength = value.length;
    const newLength = input.length;
    if (newLength > prevLength) {
      onChangeText(value + input.slice(prevLength));
    } else {
      onChangeText(value.slice(0, newLength));
    }
  };

  return (
    <View className="relative">
      <TextInput
        {...props}
        className={className}
        value={showPassword ? value : '•'.repeat(value.length)}
        onChangeText={handleChange}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        importantForAutofill="no"
        keyboardType={showPassword ? 'default' : 'visible-password'}
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
