import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCharacters } from '~/hooks/useCharacters';
import { useUserStore } from '~/store/useUserStore';
import type { Character } from '~/types';
import { ANIMAL_TYPES, ANIMAL_AGE_RANGES, GENDERS, getHumanEmoji } from '~/types';
import CharacterLimitModal from './CharacterLimitModal';

const MAX_CHARACTERS_PER_STORY = 2;

type CharacterSectionProps = {
  isNight: boolean;
  selectedCharacters: Character[];
  onCharactersChange: (characters: Character[]) => void;
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
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-28 h-32 rounded-2xl mr-3 overflow-hidden ${isSelected ? 'border-4 border-green-500' : ''
        }`}
      style={{
        backgroundColor: isNight ? '#334155' : '#f3f4f6',
      }}
    >
      <View className="flex-1 items-center justify-center p-2">
        {/* Avatar/Icon */}
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${character.type === 'HUMAN' ? 'bg-blue-500' : 'bg-orange-500'
            }`}
        >
          <Text className="text-2xl">
            {getHumanEmoji(character)}
          </Text>
        </View>

        {/* Name */}
        <Text
          className={`font-baloo-semibold text-center text-sm ${isNight ? 'text-white' : 'text-gray-800'
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
        className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${isNight ? 'bg-slate-600' : 'bg-gray-300'
          }`}
      >
        <Feather name="plus" size={24} color={isNight ? '#fff' : '#374151'} />
      </View>
      <Text
        className={`font-baloo-medium text-sm text-center ${isNight ? 'text-white/70' : 'text-gray-600'
          }`}
      >
        {t('character.createNew')}
      </Text>
    </TouchableOpacity>
  );
}

// Character limits by subscription plan
const CHARACTER_LIMITS = {
  FREE: 2,
  EXPLORER: 2,
  ADVENTURER: 5,
  LEGEND: 5,
} as const;

export default function CharacterSection({
  isNight,
  selectedCharacters,
  onCharactersChange,
  onCreateNew,
  onEditCharacter,
}: CharacterSectionProps) {
  const { t } = useTranslation();
  const { data: characters, isLoading, error } = useCharacters();
  const subscriptionPlan = useUserStore((state) => state.user?.subscriptionPlan ?? 'FREE');
  const [showLimitModal, setShowLimitModal] = useState(false);

  const isFreeUser = subscriptionPlan === 'FREE' || subscriptionPlan === 'EXPLORER';
  const characterLimit = CHARACTER_LIMITS[subscriptionPlan] ?? CHARACTER_LIMITS.FREE;
  const characterCount = characters?.length ?? 0;
  const hasReachedLimit = characterCount >= characterLimit;

  const handleCreateNew = () => {
    if (hasReachedLimit) {
      setShowLimitModal(true);
    } else {
      onCreateNew();
    }
  };

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
        intensity={90}
        tint={isNight ? 'dark' : 'light'}
        style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '' }}
      >
        <Text
          className={`text-2xl font-baloo-semibold mb-1 ${isNight ? 'text-white' : 'text-slate-900'
            }`}
        >
          {t('character.title')}
        </Text>
        <Text
          className={`text-sm font-baloo mb-4 ${isNight ? 'text-white/80' : 'text-slate-600'
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
            <CreateNewCard onPress={handleCreateNew} isNight={isNight} />
            {characters?.map((character) => {
              const isSelected = selectedCharacters.some((c) => c.id === character.id);
              return (
                <CharacterCard
                  key={character.id}
                  character={character}
                  isSelected={isSelected}
                  onPress={() => {
                    if (isSelected) {
                      // Désélectionner le personnage
                      onCharactersChange(selectedCharacters.filter((c) => c.id !== character.id));
                    } else if (selectedCharacters.length < MAX_CHARACTERS_PER_STORY) {
                      // Ajouter le personnage si on n'a pas atteint la limite
                      onCharactersChange([...selectedCharacters, character]);
                    }
                    // Si la limite est atteinte, on ne fait rien (le personnage ne peut pas être ajouté)
                  }}
                  isNight={isNight}
                />
              );
            })}
          </ScrollView>
        )}

        {/* Selected characters info */}
        {selectedCharacters.length > 0 && (
          <View className="mt-4 gap-2">
            {/* Counter */}
            <Text
              className={`font-baloo-medium text-sm ${isNight ? 'text-white/60' : 'text-gray-500'
                }`}
            >
              {t('character.selected', { count: selectedCharacters.length, max: MAX_CHARACTERS_PER_STORY })}
            </Text>

            {selectedCharacters.map((character) => (
              <View
                key={character.id}
                className={`p-4 rounded-xl ${isNight ? 'bg-slate-700/50' : 'bg-gray-100'
                  }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text
                      className={`font-baloo-semibold text-lg ${isNight ? 'text-white' : 'text-gray-800'
                        }`}
                    >
                      {character.name}
                    </Text>
                    <Text
                      className={`font-baloo text-sm ${isNight ? 'text-white/60' : 'text-gray-500'
                        }`}
                      numberOfLines={2}
                    >
                      {getCharacterSummary(character)}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => onEditCharacter(character)}
                      className={`p-2 rounded-lg ${isNight ? 'bg-slate-600' : 'bg-gray-200'}`}
                    >
                      <Feather
                        name="edit-2"
                        size={18}
                        color={isNight ? '#fff' : '#374151'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onCharactersChange(selectedCharacters.filter((c) => c.id !== character.id))}
                      className={`p-2 rounded-lg ${isNight ? 'bg-slate-600' : 'bg-gray-200'}`}
                    >
                      <Feather name="x" size={18} color={isNight ? '#fff' : '#374151'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {!isLoading && !error && (!characters || characters.length === 0) && (
          <View className="items-center py-2">
            <Text
              className={`font-baloo text-sm ${isNight ? 'text-white/60' : 'text-gray-500'
                }`}
            >
              {t('character.noCharacters')}
            </Text>
          </View>
        )}
      </BlurView>

      {/* Character Limit Modal */}
      <CharacterLimitModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        isFreeUser={isFreeUser}
      />
    </View>
  );
}
