import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/context/ThemeContext';
import type { Character } from '~/types';
import { getHumanEmoji } from '~/types';

type DeleteCharacterModalProps = {
  visible: boolean;
  character: Character | null;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
};

export default function DeleteCharacterModal({
  visible,
  character,
  onConfirm,
  onCancel,
  isPending = false,
}: DeleteCharacterModalProps) {
  const { t } = useTranslation();
  const { isNight } = useTheme();

  if (!character) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          className={`${isNight ? 'bg-slate-800' : 'bg-white'} rounded-3xl w-full max-w-sm overflow-hidden`}
        >
          {/* Header */}
          <View className={`${isNight ? 'bg-slate-900' : 'bg-[#0D1821]'} p-6`}>
            <Text className="text-white text-2xl font-baloo-bold text-center">
              {t('character.deleteConfirm')}
            </Text>
          </View>

          {/* Content */}
          <View className="p-6">
            {/* Character preview */}
            <View
              className={`${isNight ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-xl p-4 flex-row items-center mb-4`}
            >
              <View
                className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${
                  character.type === 'HUMAN' ? 'bg-blue-500' : 'bg-orange-500'
                }`}
              >
                <Text className="text-3xl">{getHumanEmoji(character)}</Text>
              </View>
              <View className="flex-1">
                <Text
                  className={`font-baloo-semibold text-lg ${
                    isNight ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {character.name}
                </Text>
                <Text
                  className={`font-baloo text-sm ${
                    isNight ? 'text-white/60' : 'text-gray-500'
                  }`}
                >
                  {character.type === 'HUMAN'
                    ? t('character.human')
                    : t('character.animal')}
                </Text>
              </View>
            </View>

            {/* Warning */}
            <View
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row items-center"
            >
              <Text className="text-red-500 text-xl mr-3">⚠️</Text>
              <Text className="text-red-700 font-baloo text-sm flex-1">
                {t('character.deleteWarning')}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="p-6 pt-0 flex-row gap-3">
            <TouchableOpacity
              className={`${isNight ? 'bg-slate-700' : 'bg-gray-200'} px-6 flex-1 py-4 rounded-xl items-center`}
              onPress={onCancel}
              disabled={isPending}
            >
              <Text
                className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}
              >
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`bg-red-500 px-6 flex-1 py-4 rounded-xl items-center ${isPending ? 'opacity-50' : ''}`}
              onPress={onConfirm}
              disabled={isPending}
            >
              <Text className="text-white font-baloo-bold text-lg">
                {isPending ? t('common.loading') : t('common.delete')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
