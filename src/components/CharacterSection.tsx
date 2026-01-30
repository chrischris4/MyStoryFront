import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCharacters } from '~/hooks/useCharacters';
import type { Character } from '~/types';
import { ANIMAL_TYPES, ANIMAL_AGE_RANGES, GENDERS } from '~/types';

type CharacterSectionProps = {
  isNight: boolean;
  selectedCharacter: Character | null;
  onCharacterSelect: (character: Character | null) => void;
  onCreateNew: () => void;
  onEditCharacter: (character: Character) => void;
};

function CharacterCard({
  character,
  isSelected,
  onPress,
  isNight,
}: {
  character: Character;
  isSelected: boolean;
  onPress: () => void;
  isNight: boolean;
}) {
  const animalEmoji = ANIMAL_TYPES.find((a) => a.id === character.animalType)?.emoji;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-28 h-32 rounded-2xl mr-3 overflow-hidden ${
        isSelected ? 'border-4 border-green-500' : ''
      }`}
      style={{
        backgroundColor: isNight ? '#334155' : '#f3f4f6',
      }}
    >
      <View className="flex-1 items-center justify-center p-2">
        {/* Avatar/Icon */}
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
            character.type === 'HUMAN' ? 'bg-blue-500' : 'bg-orange-500'
          }`}
        >
          <Text className="text-2xl">
            {character.type === 'HUMAN' ? '👤' : animalEmoji || '🐾'}
          </Text>
        </View>

        {/* Name */}
        <Text
          className={`font-baloo-semibold text-center text-sm ${
            isNight ? 'text-white' : 'text-gray-800'
          }`}
          numberOfLines={1}
        >
          {character.name}
        </Text>
      </View>

      {/* Selected indicator */}
      {isSelected && (
        <View className="absolute top-2 right-2 bg-green-500 rounded-full w-6 h-6 items-center justify-center">
          <Feather name="check" size={14} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

function CreateNewCard({
  onPress,
  isNight,
}: {
  onPress: () => void;
  isNight: boolean;
}) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-28 h-32 rounded-2xl mr-3 items-center justify-center border-2 border-dashed"
      style={{
        borderColor: isNight ? '#64748b' : '#9ca3af',
        backgroundColor: isNight ? '#1e293b40' : '#f9fafb40',
      }}
    >
      <View
        className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
          isNight ? 'bg-slate-600' : 'bg-gray-300'
        }`}
      >
        <Feather name="plus" size={24} color={isNight ? '#fff' : '#374151'} />
      </View>
      <Text
        className={`font-baloo-medium text-sm text-center ${
          isNight ? 'text-white/70' : 'text-gray-600'
        }`}
      >
        {t('character.createNew')}
      </Text>
    </TouchableOpacity>
  );
}

export default function CharacterSection({
  isNight,
  selectedCharacter,
  onCharacterSelect,
  onCreateNew,
  onEditCharacter,
}: CharacterSectionProps) {
  const { t } = useTranslation();
  const { data: characters, isLoading, error } = useCharacters();

  // Build character summary for display
  const getCharacterSummary = (character: Character): string => {
    const parts: string[] = [];

    // Gender
    const genderLabel = GENDERS.find((g) => g.id === character.gender)?.label;
    if (genderLabel) parts.push(genderLabel);

    if (character.type === 'HUMAN') {
      if (character.age) parts.push(`${character.age} ans`);
      if (character.skinColor) parts.push(`peau ${character.skinColor}`);
      if (character.hairColor) parts.push(`cheveux ${character.hairColor}`);
      if (character.eyeColor) parts.push(`yeux ${character.eyeColor}`);
    } else {
      const animalLabel = ANIMAL_TYPES.find((a) => a.id === character.animalType)?.label;
      if (animalLabel) parts.push(animalLabel);
      const ageLabel = ANIMAL_AGE_RANGES.find((a) => a.id === character.animalAge)?.label;
      if (ageLabel) parts.push(ageLabel.toLowerCase());
      if (character.furColor) parts.push(`pelage ${character.furColor}`);
    }

    return parts.join(', ');
  };

  return (
    <View
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      <BlurView
        intensity={isNight ? 90 : 50}
        tint={isNight ? 'dark' : 'light'}
        style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '' }}
      >
        <Text
          className={`text-2xl font-baloo-semibold mb-1 ${
            isNight ? 'text-white/80' : 'text-slate-900'
          }`}
        >
          {t('character.title')}
        </Text>
        <Text
          className={`text-sm font-baloo mb-4 ${
            isNight ? 'text-white/60' : 'text-slate-600'
          }`}
        >
          {t('character.subtitle')}
        </Text>

        {/* Character list */}
        {isLoading ? (
          <View className="h-32 items-center justify-center">
            <ActivityIndicator size="small" color={isNight ? '#fff' : '#0D1821'} />
          </View>
        ) : error ? (
          <View className="h-32 items-center justify-center">
            <Text className={`${isNight ? 'text-red-400' : 'text-red-500'} font-baloo`}>
              {t('errors.loadingError')}
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <CreateNewCard onPress={onCreateNew} isNight={isNight} />
            {characters?.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={selectedCharacter?.id === character.id}
                onPress={() =>
                  onCharacterSelect(
                    selectedCharacter?.id === character.id ? null : character
                  )
                }
                isNight={isNight}
              />
            ))}
          </ScrollView>
        )}

        {/* Selected character info */}
        {selectedCharacter && (
          <View
            className={`mt-4 p-4 rounded-xl ${
              isNight ? 'bg-slate-700/50' : 'bg-gray-100'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text
                  className={`font-baloo-semibold text-lg ${
                    isNight ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {selectedCharacter.name}
                </Text>
                <Text
                  className={`font-baloo text-sm ${
                    isNight ? 'text-white/60' : 'text-gray-500'
                  }`}
                  numberOfLines={2}
                >
                  {getCharacterSummary(selectedCharacter)}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => onEditCharacter(selectedCharacter)}
                  className={`p-2 rounded-lg ${isNight ? 'bg-slate-600' : 'bg-gray-200'}`}
                >
                  <Feather
                    name="edit-2"
                    size={18}
                    color={isNight ? '#fff' : '#374151'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onCharacterSelect(null)}
                  className={`p-2 rounded-lg ${isNight ? 'bg-slate-600' : 'bg-gray-200'}`}
                >
                  <Feather name="x" size={18} color={isNight ? '#fff' : '#374151'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Empty state */}
        {!isLoading && !error && (!characters || characters.length === 0) && (
          <View className="items-center py-2">
            <Text
              className={`font-baloo text-sm ${
                isNight ? 'text-white/60' : 'text-gray-500'
              }`}
            >
              {t('character.noCharacters')}
            </Text>
          </View>
        )}
      </BlurView>
    </View>
  );
}
