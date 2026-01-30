import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';

type CharacterLimitModalProps = {
  visible: boolean;
  onClose: () => void;
  isFreeUser: boolean;
};

export default function CharacterLimitModal({
  visible,
  onClose,
  isFreeUser,
}: CharacterLimitModalProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleUpgrade = () => {
    onClose();
    navigation.navigate('BillingScreen');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-3xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <View className="bg-amber-500 p-6 items-center">
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-3">
              <Feather name="users" size={32} color="#fff" />
            </View>
            <Text className="text-white text-2xl font-bold text-center">
              {t('character.limitReached')}
            </Text>
          </View>

          {/* Content */}
          <View className="p-6">
            <Text className="text-gray-700 text-base text-center leading-6">
              {isFreeUser
                ? t('character.freeLimitMessage')
                : t('character.premiumLimitMessage')}
            </Text>

            {!isFreeUser && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 flex-row items-start">
                <Text className="text-amber-600 text-xl mr-3">💡</Text>
                <Text className="text-amber-800 text-sm flex-1">
                  {t('character.deleteToCreate')}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View className="p-6 pt-0 gap-3">
            {isFreeUser && (
              <TouchableOpacity
                className="bg-amber-500 px-6 py-4 rounded-xl items-center flex-row justify-center"
                onPress={handleUpgrade}
              >
                <Feather name="star" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-lg">
                  {t('character.upgradePlan')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="bg-gray-200 px-6 py-4 rounded-xl items-center"
              onPress={onClose}
            >
              <Text className="text-gray-800 font-semibold text-lg">
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
