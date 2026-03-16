import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Switch } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '~/store/useUserStore';
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
  onConfirm: (isShared: boolean) => void;
  onCancel: () => void;
  onTestCreate?: (isShared: boolean) => void;
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
  onTestCreate,
}: ConfirmationModalProps) {
  const { t } = useTranslation();
  const [isShared, setIsShared] = useState(true);
  const storyCoin = useUserStore((state) => state.user?.storyCoin ?? 0);

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
            <Text className="text-white text-2xl font-baloo-bold text-center">
              {t('storyCreation.confirmTitle')}
            </Text>
            <Text className="text-white/80 text-sm font-baloo text-center mt-2">
              {t('storyCreation.confirmSubtitle')}
            </Text>
          </View>

          {/* Content */}
          <ScrollView className="max-h-96">
            <View className="p-6">
              {/* Titre */}
              <View className="mb-4">
                <Text className="text-gray-500 text-base font-baloo-semibold mb-1">
                  {t('storyCreation.storyTitle')}
                </Text>
                <View className="bg-gray-100 rounded-xl p-4">
                  <Text className="text-gray-800 text-lg font-baloo-semibold">
                    {title}
                  </Text>
                </View>
              </View>

              {/* Résumé */}
              <View className="mb-4">
                <Text className="text-gray-500 text-base font-baloo-semibold mb-1">
                  {t('storyCreation.summary')}
                </Text>
                <View className="bg-gray-100 rounded-xl p-4">
                  <Text className="text-gray-800 font-baloo text-base">
                    {prompt}
                  </Text>
                </View>
              </View>

              {/* Personnages */}
              {characters.length > 0 && (
                <View className="mb-4">
                  <Text className="text-gray-500 text-base font-baloo-semibold mb-1">
                    {t('storyCreation.characters', { count: characters.length })}
                  </Text>
                  <View className="gap-2">
                    {characters.map((character) => (
                      <View key={character.id} className="bg-gray-100 rounded-xl p-4 flex-row items-center">
                        <Text className="text-2xl mr-3">
                          {getHumanEmoji(character)}
                        </Text>
                        <View className="flex-1">
                          <Text className="text-gray-800 font-baloo-semibold">
                            {character.name}
                          </Text>
                          <Text className="text-gray-600 font-baloo text-sm">
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
                  <Text className="text-gray-500 text-base font-baloo-semibold mb-1">
                    {t('storyCreation.style')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 justify-center flex-row items-center">
                    <Text className="text-2xl h-9"></Text>
                    <Text className="text-gray-800 font-baloo-semibold">
                      {styleName}
                    </Text>
                  </View>
                </View>

                {/* Langue */}
                <View className="flex-1">
                  <Text className="text-gray-500 text-base font-baloo-semibold mb-1">
                    {t('storyCreation.language')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 justify-center flex-row items-center">
                    <Text className="text-2xl mr-2">{languageFlag}</Text>
                    <Text className="text-gray-800 font-baloo-semibold">
                      {languageName}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row gap-3 mb-4">

                {/* Tranche d'âge */}
                {ageGroupName && (
                  <View className="flex-1 w-1/2">
                    <Text className="text-gray-500 text-base font-baloo-semibold mb-1">
                      {t('storyCreation.ageGroup')}
                    </Text>
                    <View className="bg-gray-100 rounded-xl h-16 p-4 justify-center flex-row items-center">
                      <Text className="text-gray-800 font-baloo-semibold">
                        {ageGroupName}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Nombre de pages */}
                <View className="flex-1">
                  <Text className="text-gray-500 text-base font-baloo-semibold mb-1">
                    {t('storyCreation.numPages')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl h-16 p-4 items-center justify-center">
                    <Text className="text-gray-800 text-2xl font-baloo-bold">
                      {numPages}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Toggle partage */}
              <View className="bg-gray-100 rounded-2xl pt-2 pb-4 px-4 mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-1">
                    <Feather name='globe' size={18} color='#000' />
                    <Text className="text-gray-800 font-baloo-semibold text-base">
                      {t('storyCreation.shareStory', 'Partager l\'histoire')}
                    </Text>
                  </View>
                  <Switch
                    value={isShared}
                    onValueChange={setIsShared}
                    trackColor={{ false: '#d1d5db', true: '#86efac' }}
                    thumbColor={isShared ? '#16a34a' : '#9ca3af'}
                  />
                </View>
                <Text className="text-gray-700 font-baloo mt-2 text-sm">
                  {t('storyCreation.shareReward', 'Après 10 histoires partagées, 1 jeton vous est offert !')}
                </Text>
              </View>

              {/* Info coût */}
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-start">
                <Feather name="info" size={20} color="#2563eb" style={{ marginRight: 12, marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-blue-800 font-baloo-semibold mb-1">
                    {t('storyCreation.importantInfo')}
                  </Text>
                  <Text className="text-blue-700 font-baloo text-sm">
                    {t('storyCreation.costInfo')}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="p-6 pt-3 gap-3">
            {onTestCreate && (
              <TouchableOpacity
                className="bg-[#0D1821] px-6 py-4 rounded-xl items-center"
                onPress={() => onTestCreate(isShared)}
              >
                <Text className="text-white font-baloo-bold text-lg">
                  {t('storyCreation.confirmAndCreate')} test !
                </Text>
              </TouchableOpacity>
            )}
            {storyCoin >= 1 && (
              <TouchableOpacity
                className="bg-[#0D1821] px-6 py-4 rounded-xl items-center"
                onPress={() => onConfirm(isShared)}
              >
                <Text className="text-white font-baloo-bold text-lg">
                  {t('storyCreation.confirmAndCreate')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="bg-gray-200 px-6 py-4 rounded-xl items-center"
              onPress={onCancel}
            >
              <Text className="text-gray-800 font-baloo-semibold text-lg">
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
