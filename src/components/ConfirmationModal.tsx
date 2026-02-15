import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import type { Character } from '~/types';
import { GENDERS, ANIMAL_TYPES, ANIMAL_AGE_RANGES, SKIN_COLORS, HAIR_COLORS, EYE_COLORS, FUR_COLORS, getHumanEmoji } from '~/types';

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  prompt: string;
  numPages: number;
  styleName: string;
  languageName: string;
  languageFlag: string;
  ageGroupName?: string;
  ageGroupEmoji?: string;
  characters?: Character[];
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationModal({
  visible,
  title,
  prompt,
  numPages,
  styleName,
  languageName,
  languageFlag,
  ageGroupName,
  ageGroupEmoji,
  characters = [],
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const { t } = useTranslation();

  // Build character summary
  const getCharacterSummary = (char: Character): string => {
    const parts: string[] = [];

    const genderLabel = GENDERS.find((g) => g.id === char.gender)?.label;
    if (genderLabel) parts.push(genderLabel.toLowerCase());

    if (char.type === 'HUMAN') {
      if (char.age) parts.push(`${char.age} ans`);
      const skinLabel = SKIN_COLORS.find((s) => s.id === char.skinColor)?.label || char.skinColor;
      if (skinLabel) parts.push(`peau ${skinLabel.toLowerCase()}`);
      const hairLabel = HAIR_COLORS.find((h) => h.id === char.hairColor)?.label || char.hairColor;
      if (hairLabel) parts.push(`cheveux ${hairLabel.toLowerCase()}`);
      const eyeLabel = EYE_COLORS.find((e) => e.id === char.eyeColor)?.label || char.eyeColor;
      if (eyeLabel) parts.push(`yeux ${eyeLabel.toLowerCase()}`);
    } else {
      const animalLabel = ANIMAL_TYPES.find((a) => a.id === char.animalType)?.label || char.animalType;
      if (animalLabel) parts.push(animalLabel.toLowerCase());
      const ageLabel = ANIMAL_AGE_RANGES.find((a) => a.id === char.animalAge)?.label;
      if (ageLabel) parts.push(ageLabel.toLowerCase());
      const furLabel = FUR_COLORS.find((f) => f.id === char.furColor)?.label || char.furColor;
      if (furLabel) parts.push(`pelage ${furLabel.toLowerCase()}`);
    }

    return parts.join(', ');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-3xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <View className="bg-[#0D1821] p-6">
            <Text className="text-white text-2xl font-bold text-center">
              {t('storyCreation.confirmTitle')}
            </Text>
            <Text className="text-white/70 text-sm text-center mt-2">
              {t('storyCreation.confirmSubtitle')}
            </Text>
          </View>

          {/* Content */}
          <ScrollView className="max-h-96">
            <View className="p-6">
              {/* Titre */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm font-semibold mb-1">
                  {t('storyCreation.storyTitle')}
                </Text>
                <View className="bg-gray-100 rounded-xl p-4">
                  <Text className="text-gray-800 text-lg font-semibold">
                    {title}
                  </Text>
                </View>
              </View>

              {/* Résumé */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm font-semibold mb-1">
                  {t('storyCreation.summary')}
                </Text>
                <View className="bg-gray-100 rounded-xl p-4">
                  <Text className="text-gray-800 text-base">
                    {prompt}
                  </Text>
                </View>
              </View>

              {/* Personnages */}
              {characters.length > 0 && (
                <View className="mb-4">
                  <Text className="text-gray-500 text-sm font-semibold mb-1">
                    {t('storyCreation.characters', { count: characters.length })}
                  </Text>
                  <View className="gap-2">
                    {characters.map((character) => (
                      <View key={character.id} className="bg-gray-100 rounded-xl p-4 flex-row items-center">
                        <Text className="text-2xl mr-3">
                          {getHumanEmoji(character)}
                        </Text>
                        <View className="flex-1">
                          <Text className="text-gray-800 font-semibold">
                            {character.name}
                          </Text>
                          <Text className="text-gray-600 text-sm">
                            {getCharacterSummary(character)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Style et Langue */}
              <View className="flex-row gap-3 mb-4">
                {/* Style */}
                <View className="flex-1 w-1/2">
                  <Text className="text-gray-500 text-sm font-semibold mb-1">
                    {t('storyCreation.style')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 justify-center flex-row items-center">
                    <Text className="text-2xl h-9"></Text>
                    <Text className="text-gray-800 font-semibold">
                      {styleName}
                    </Text>
                  </View>
                </View>

                {/* Langue */}
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm font-semibold mb-1">
                    {t('storyCreation.language')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 justify-center flex-row items-center">
                    <Text className="text-2xl mr-2">{languageFlag}</Text>
                    <Text className="text-gray-800 font-semibold">
                      {languageName}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row gap-3 mb-4">

                {/* Tranche d'âge */}
                {ageGroupName && (
                <View className="flex-1 w-1/2">
                    <Text className="text-gray-500 text-sm font-semibold mb-1">
                      {t('storyCreation.ageGroup')}
                    </Text>
                    <View className="bg-gray-100 rounded-xl p-4 justify-center flex-row items-center">
                      <Text className="text-2xl h-9"></Text>
                      <Text className="text-gray-800 font-semibold">
                        {ageGroupName}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Nombre de pages */}
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm font-semibold mb-1">
                    {t('storyCreation.numPages')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 items-center justify-center">
                    <Text className="text-gray-800 text-2xl font-bold">
                      {numPages}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Info coût */}
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-start">
                <Text className="text-blue-600 text-xl mr-3">ℹ️</Text>
                <View className="flex-1">
                  <Text className="text-blue-800 font-semibold mb-1">
                    {t('storyCreation.importantInfo')}
                  </Text>
                  <Text className="text-blue-700 text-sm">
                    {t('storyCreation.costInfo')}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="p-6 pt-0 gap-3">
            <TouchableOpacity
              className="bg-[#0D1821] px-6 py-4 rounded-xl items-center"
              onPress={onConfirm}
            >
              <Text className="text-white font-bold text-lg">
                {t('storyCreation.confirmAndCreate')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-200 px-6 py-4 rounded-xl items-center"
              onPress={onCancel}
            >
              <Text className="text-gray-800 font-semibold text-lg">
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
