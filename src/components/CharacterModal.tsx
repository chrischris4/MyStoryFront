import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '~/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useCreateCharacter } from '~/hooks/useCreateCharacter';
import { useUpdateCharacter } from '~/hooks/useUpdateCharacter';
import Toast from 'react-native-toast-message';
import type {
  Character,
  CharacterType,
  CharacterOption,
  CreateCharacterInput,
} from '~/types';
import type { Gender, AnimalAge } from '~/types';
import {
  SKIN_COLORS,
  HAIR_COLORS,
  EYE_COLORS,
  ANIMAL_TYPES,
  FUR_COLORS,
  GENDERS,
  ANIMAL_AGE_RANGES,
} from '~/types';

type CharacterModalProps = {
  visible: boolean;
  onClose: () => void;
  onCharacterCreated?: (character: Character) => void;
  editCharacter?: Character | null;
};

type OptionSelectorProps = {
  label: string;
  options: CharacterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  isNight: boolean;
  showCustomInput?: boolean;
};

function OptionSelector({
  label,
  options,
  selectedValue,
  onSelect,
  isNight,
  showCustomInput = true,
}: OptionSelectorProps) {
  const { t } = useTranslation();
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const isCustomSelected = selectedValue && !options.find((o) => o.id === selectedValue);

  useEffect(() => {
    if (isCustomSelected) {
      setShowCustom(true);
      setCustomValue(selectedValue);
    }
  }, [selectedValue, isCustomSelected]);

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onSelect(customValue.trim());
    }
  };

  return (
    <View className="mb-4">
      <Text
        className={`${isNight ? 'text-white' : 'text-gray-600'} text-sm font-baloo-semibold mb-2`}
      >
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValue === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => {
                onSelect(option.id);
                setShowCustom(false);
              }}
              className={`px-3 py-2 rounded-xl flex-row items-center gap-1 ${
                isSelected
                  ? 'bg-green-500'
                  : isNight
                    ? 'bg-slate-700'
                    : 'bg-gray-200'
              }`}
            >
              {option.emoji && <Text className="text-base">{option.emoji}</Text>}
              <Text
                className={`font-baloo-medium ${
                  isSelected ? 'text-white' : isNight ? 'text-white/80' : 'text-gray-700'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {showCustomInput && (
          <TouchableOpacity
            onPress={() => setShowCustom(!showCustom)}
            className={`px-3 py-2 rounded-xl flex-row items-center gap-1 ${
              isCustomSelected
                ? 'bg-green-500'
                : isNight
                  ? 'bg-slate-700'
                  : 'bg-gray-200'
            }`}
          >
            <Feather
              name="plus"
              size={14}
              color={isCustomSelected ? '#fff' : isNight ? '#fff' : '#374151'}
            />
            <Text
              className={`font-baloo-medium ${
                isCustomSelected ? 'text-white' : isNight ? 'text-white/80' : 'text-gray-700'
              }`}
            >
              {t('character.other')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {showCustom && showCustomInput && (
        <View className="mt-2 flex-row gap-2">
          <TextInput
            className={`flex-1 ${
              isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
            } rounded-xl p-3 font-baloo`}
            value={customValue}
            onChangeText={setCustomValue}
            placeholder={t('character.enterCustomValue')}
            placeholderTextColor={isNight ? '#94a3b8' : '#9ca3af'}
            onSubmitEditing={handleCustomSubmit}
          />
          <TouchableOpacity
            onPress={handleCustomSubmit}
            className="bg-green-500 px-4 rounded-xl justify-center"
          >
            <Feather name="check" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function CharacterModal({
  visible,
  onClose,
  onCharacterCreated,
  editCharacter,
}: CharacterModalProps) {
  const { t } = useTranslation();
  const { isNight } = useTheme();
  const createCharacterMutation = useCreateCharacter();
  const updateCharacterMutation = useUpdateCharacter();

  const isEditing = !!editCharacter;
  const isPending = createCharacterMutation.isPending || updateCharacterMutation.isPending;

  // Form state
  const [characterType, setCharacterType] = useState<CharacterType>('HUMAN');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [age, setAge] = useState('');
  const [animalAge, setAnimalAge] = useState<AnimalAge | ''>('');
  const [description, setDescription] = useState('');
  // Human fields
  const [skinColor, setSkinColor] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [clothing, setClothing] = useState('');
  // Animal fields
  const [animalType, setAnimalType] = useState('');
  const [furColor, setFurColor] = useState('');

  // Errors
  const [errors, setErrors] = useState<{ name?: string; type?: string }>({});

  // Initialize form when editing
  useEffect(() => {
    if (editCharacter) {
      setCharacterType(editCharacter.type);
      setName(editCharacter.name);
      setGender((editCharacter.gender as Gender) || '');
      setAge(editCharacter.age?.toString() || '');
      setAnimalAge((editCharacter.animalAge as AnimalAge) || '');
      setDescription(editCharacter.description || '');
      setSkinColor(editCharacter.skinColor || '');
      setHairColor(editCharacter.hairColor || '');
      setEyeColor(editCharacter.eyeColor || '');
      setClothing(editCharacter.clothing || '');
      setAnimalType(editCharacter.animalType || '');
      setFurColor(editCharacter.furColor || '');
    } else {
      resetForm();
    }
  }, [editCharacter, visible]);

  const resetForm = () => {
    setCharacterType('HUMAN');
    setName('');
    setGender('');
    setAge('');
    setAnimalAge('');
    setDescription('');
    setSkinColor('');
    setHairColor('');
    setEyeColor('');
    setClothing('');
    setAnimalType('');
    setFurColor('');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; type?: string } = {};

    if (!name.trim()) {
      newErrors.name = t('character.validation.nameRequired');
    } else if (name.trim().length < 2) {
      newErrors.name = t('character.validation.nameMin');
    } else if (name.trim().length > 50) {
      newErrors.name = t('character.validation.nameMax');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const characterData: CreateCharacterInput = {
      name: name.trim(),
      type: characterType,
      gender: gender || undefined,
      description: description.trim() || undefined,
      ...(characterType === 'HUMAN'
        ? {
            age: age ? parseInt(age, 10) : undefined,
            skinColor: skinColor || undefined,
            hairColor: hairColor || undefined,
            eyeColor: eyeColor || undefined,
            clothing: clothing.trim() || undefined,
          }
        : {
            animalAge: animalAge || undefined,
            animalType: animalType || undefined,
            furColor: furColor || undefined,
          }),
    };

    if (isEditing && editCharacter) {
      updateCharacterMutation.mutate(
        { id: editCharacter.id, data: characterData },
        {
          onSuccess: (updatedCharacter) => {
            Toast.show({
              type: 'success',
              text1: t('character.updated'),
              text2: t('character.updatedMessage'),
            });
            onCharacterCreated?.(updatedCharacter);
            onClose();
            resetForm();
          },
          onError: (error) => {
            Toast.show({
              type: 'error',
              text1: t('common.error'),
              text2: error instanceof Error ? error.message : t('errors.unknownError'),
            });
          },
        }
      );
    } else {
      createCharacterMutation.mutate(characterData, {
        onSuccess: (newCharacter) => {
          Toast.show({
            type: 'success',
            text1: t('character.created'),
            text2: t('character.createdMessage'),
          });
          onCharacterCreated?.(newCharacter);
          onClose();
          resetForm();
        },
        onError: (error) => {
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: error instanceof Error ? error.message : t('errors.unknownError'),
          });
        },
      });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View
            className={`${isNight ? 'bg-slate-800' : 'bg-white'} rounded-3xl w-full max-w-lg overflow-hidden max-h-[90%]`}
          >
            {/* Header */}
            <View className={`${isNight ? 'bg-slate-900' : 'bg-[#0D1821]'} p-6`}>
              <Text className="text-white text-2xl font-baloo-bold text-center">
                {isEditing ? t('character.modalEditTitle') : t('character.modalTitle')}
              </Text>
              <Text className="text-white/70 text-sm font-baloo text-center mt-2">
                {t('character.modalSubtitle')}
              </Text>
            </View>

            {/* Content */}
            <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
              {/* Type selector */}
              <View className="mb-4">
                <Text
                  className={`${isNight ? 'text-white' : 'text-gray-600'} text-sm font-baloo-semibold mb-2`}
                >
                  {t('character.type')}
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setCharacterType('HUMAN')}
                    className={`flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2 ${
                      characterType === 'HUMAN'
                        ? 'bg-blue-500'
                        : isNight
                          ? 'bg-slate-700'
                          : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`font-baloo-semibold ${
                        characterType === 'HUMAN'
                          ? 'text-white'
                          : isNight
                            ? 'text-white/80'
                            : 'text-gray-700'
                      }`}
                    >
                      {t('character.human')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setCharacterType('ANIMAL')}
                    className={`flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2 ${
                      characterType === 'ANIMAL'
                        ? 'bg-blue-500'
                        : isNight
                          ? 'bg-slate-700'
                          : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`font-baloo-semibold ${
                        characterType === 'ANIMAL'
                          ? 'text-white'
                          : isNight
                            ? 'text-white/80'
                            : 'text-gray-700'
                      }`}
                    >
                      {t('character.animal')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Name */}
              <View className="mb-4">
                <Text
                  className={`${isNight ? 'text-white' : 'text-gray-600'} text-sm font-baloo-semibold mb-2`}
                >
                  {t('character.name')}
                </Text>
                <TextInput
                  className={`${
                    isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
                  } rounded-xl p-4 font-baloo ${errors.name ? 'border-2 border-red-500' : ''}`}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('character.namePlaceholder')}
                  placeholderTextColor={isNight ? '#94a3b8' : '#9ca3af'}
                />
                {errors.name && (
                  <Text className="text-red-500 text-sm mt-1 font-baloo">{errors.name}</Text>
                )}
              </View>

              {/* Gender */}
              <OptionSelector
                label={t('character.gender')}
                options={GENDERS}
                selectedValue={gender}
                onSelect={(value) => setGender(value as Gender)}
                isNight={isNight}
                showCustomInput={false}
              />

              {/* Age - différent selon le type */}
              {characterType === 'HUMAN' ? (
                <View className="mb-4">
                  <Text
                    className={`${isNight ? 'text-white' : 'text-gray-600'} text-sm font-baloo-semibold mb-2`}
                  >
                    {t('character.age')}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      className={`${
                        isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
                      } rounded-xl p-4 font-baloo w-24 text-center`}
                      value={age}
                      onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
                      placeholder="8"
                      placeholderTextColor={isNight ? '#94a3b8' : '#9ca3af'}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                    <Text
                      className={`${isNight ? 'text-white/70' : 'text-gray-500'} font-baloo text-lg`}
                    >
                      {t('character.yearsOld')}
                    </Text>
                  </View>
                </View>
              ) : (
                <OptionSelector
                  label={t('character.animalAgeLabel')}
                  options={ANIMAL_AGE_RANGES}
                  selectedValue={animalAge}
                  onSelect={(value) => setAnimalAge(value as AnimalAge)}
                  isNight={isNight}
                  showCustomInput={false}
                />
              )}

              {/* Human-specific fields */}
              {characterType === 'HUMAN' && (
                <>
                  <OptionSelector
                    label={t('character.skinColor')}
                    options={SKIN_COLORS}
                    selectedValue={skinColor}
                    onSelect={setSkinColor}
                    isNight={isNight}
                  />

                  <OptionSelector
                    label={t('character.hairColor')}
                    options={HAIR_COLORS}
                    selectedValue={hairColor}
                    onSelect={setHairColor}
                    isNight={isNight}
                  />

                  <OptionSelector
                    label={t('character.eyeColor')}
                    options={EYE_COLORS}
                    selectedValue={eyeColor}
                    onSelect={setEyeColor}
                    isNight={isNight}
                  />

                  <View className="mb-4">
                    <Text
                      className={`${isNight ? 'text-white' : 'text-gray-600'} text-sm font-baloo-semibold mb-2`}
                    >
                      {t('character.clothing')}
                    </Text>
                    <TextInput
                      className={`${
                        isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
                      } rounded-xl p-4 font-baloo`}
                      value={clothing}
                      onChangeText={setClothing}
                      placeholder={t('character.clothingPlaceholder')}
                      placeholderTextColor={isNight ? '#94a3b8' : '#9ca3af'}
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                  </View>
                </>
              )}

              {/* Animal-specific fields */}
              {characterType === 'ANIMAL' && (
                <>
                  <OptionSelector
                    label={t('character.animalType')}
                    options={ANIMAL_TYPES}
                    selectedValue={animalType}
                    onSelect={setAnimalType}
                    isNight={isNight}
                  />

                  <OptionSelector
                    label={t('character.furColor')}
                    options={FUR_COLORS}
                    selectedValue={furColor}
                    onSelect={setFurColor}
                    isNight={isNight}
                  />
                </>
              )}

              {/* Description */}
              <View className="mb-4">
                <Text
                  className={`${isNight ? 'text-white' : 'text-gray-600'} text-sm font-baloo-semibold mb-2`}
                >
                  {t('character.description')}
                </Text>
                <TextInput
                  className={`${
                    isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
                  } rounded-xl p-4 font-baloo`}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t('character.descriptionPlaceholder')}
                  placeholderTextColor={isNight ? '#94a3b8' : '#9ca3af'}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={{ minHeight: 80 }}
                />
              </View>

              {/* Spacer for actions */}
              <View className="h-4" />
            </ScrollView>

            {/* Actions */}
            <View className="p-6 pt-0 gap-3">
              <TouchableOpacity
                className={`${
                  isNight ? 'bg-blue-600' : 'bg-[#0D1821]'
                } px-6 py-4 rounded-xl items-center ${isPending ? 'opacity-50' : ''}`}
                onPress={handleSave}
                disabled={isPending}
              >
                <Text className="text-white font-baloo-bold text-lg">
                  {isPending
                    ? t('common.loading')
                    : isEditing
                      ? t('common.save')
                      : t('character.createCharacter')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`${isNight ? 'bg-slate-700' : 'bg-gray-200'} px-6 py-4 rounded-xl items-center`}
                onPress={handleClose}
                disabled={isPending}
              >
                <Text
                  className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}
                >
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
