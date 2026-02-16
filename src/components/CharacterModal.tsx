import React, { useMemo, useRef, useState } from 'react';
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
import { useDeleteCharacter } from '~/hooks/useDeleteCharacter';
import Toast from 'react-native-toast-message';
import DeleteCharacterModal from './DeleteCharacterModal';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { containsProfanity } from '~/utils/profanityFilter';
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
  onCharacterDeleted?: (characterId: number) => void;
  editCharacter?: Character | null;
};

type OptionSelectorProps = {
  label: string;
  options: CharacterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  isNight: boolean;
  translationKey?: string;
  errorMessage?: string;
};

function OptionSelector({
  label,
  options,
  selectedValue,
  onSelect,
  isNight,
  translationKey,
  errorMessage,
}: OptionSelectorProps) {
  const { t } = useTranslation();

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
              }}
              className={`px-3 py-2 rounded-xl flex-row items-center gap-1 ${isSelected
                ? 'bg-green-500'
                : isNight
                  ? 'bg-slate-700'
                  : 'bg-gray-200'
                }`}
            >
              {option.emoji && <Text className="text-base">{option.emoji}</Text>}
              <Text
                className={`font-baloo-medium ${isSelected ? 'text-white' : isNight ? 'text-white/80' : 'text-gray-700'
                  }`}
              >
                {translationKey ? t(`${translationKey}.${option.id}`, option.label) : option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {errorMessage && (
        <Text className="text-red-500 text-sm mt-1 font-baloo">{errorMessage}</Text>
      )}
    </View>
  );
}

export default function CharacterModal({
  visible,
  onClose,
  onCharacterCreated,
  onCharacterDeleted,
  editCharacter,
}: CharacterModalProps) {
  const { t } = useTranslation();
  const { isNight } = useTheme();
  const createCharacterMutation = useCreateCharacter();
  const updateCharacterMutation = useUpdateCharacter();
  const deleteCharacterMutation = useDeleteCharacter();

  const scrollViewRef = useRef<ScrollView>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isEditing = !!editCharacter;

  const getDescriptionPlaceholder = () => {
    if (formik.values.characterType === 'ANIMAL') {
      const animalType = formik.values.animalType;
      if (animalType) {
        return t(`character.descriptionPlaceholders.${animalType}`, t('character.descriptionPlaceholders.animal'));
      }
      return t('character.descriptionPlaceholders.animal');
    }
    if (formik.values.gender === 'MALE') return t('character.descriptionPlaceholders.humanMale');
    if (formik.values.gender === 'FEMALE') return t('character.descriptionPlaceholders.humanFemale');
    return t('character.descriptionPlaceholders.human');
  };
  const isPending =
    createCharacterMutation.isPending ||
    updateCharacterMutation.isPending ||
    deleteCharacterMutation.isPending;

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .required(t('character.validation.nameRequired'))
          .min(2, t('character.validation.nameMin'))
          .max(25, t('character.validation.nameMax'))
          .matches(/^[\p{L}0-9-]+$/u, t('character.validation.nameFormat'))
          .test('no-profanity', t('validation.profanity'), (value) => !value || !containsProfanity(value)),
        gender: Yup.string()
          .required(t('character.validation.genderRequired')),
        age: Yup.string()
          .when('characterType', {
            is: 'HUMAN',
            then: (schema) => schema
              .required(t('character.validation.ageRequired'))
              .test('max-age', t('character.validation.ageMax'), (value) => !value || parseInt(value, 10) <= 100),
          }),
        skinColor: Yup.string()
          .when('characterType', {
            is: 'HUMAN',
            then: (schema) => schema.required(t('character.validation.skinColorRequired')),
          }),
        hairColor: Yup.string()
          .when('characterType', {
            is: 'HUMAN',
            then: (schema) => schema.required(t('character.validation.hairColorRequired')),
          }),
        eyeColor: Yup.string()
          .when('characterType', {
            is: 'HUMAN',
            then: (schema) => schema.required(t('character.validation.eyeColorRequired')),
          }),
        clothing: Yup.string()
          .max(80, t('character.validation.clothingMax'))
          .when('characterType', {
            is: 'HUMAN',
            then: (schema) => schema.required(t('character.validation.clothingRequired')),
          }),
        animalAge: Yup.string()
          .when('characterType', {
            is: 'ANIMAL',
            then: (schema) => schema.required(t('character.validation.animalAgeRequired')),
          }),
        animalType: Yup.string()
          .when('characterType', {
            is: 'ANIMAL',
            then: (schema) => schema.required(t('character.validation.animalTypeRequired')),
          }),
        furColor: Yup.string()
          .when('characterType', {
            is: 'ANIMAL',
            then: (schema) => schema.required(t('character.validation.furColorRequired')),
          }),
        description: Yup.string()
          .required(t('character.validation.descriptionRequired'))
          .max(80, t('character.validation.descriptionMax')),
      }),
    [t]
  );

  const initialValues = useMemo(
    () => ({
      characterType: (editCharacter?.type || 'HUMAN') as CharacterType,
      name: editCharacter?.name || '',
      gender: ((editCharacter?.gender as Gender) || '') as Gender | '',
      age: editCharacter?.age?.toString() || '',
      animalAge: ((editCharacter?.animalAge as AnimalAge) || '') as AnimalAge | '',
      description: editCharacter?.description || '',
      skinColor: editCharacter?.skinColor || '',
      hairColor: editCharacter?.hairColor || '',
      eyeColor: editCharacter?.eyeColor || '',
      clothing: editCharacter?.clothing || '',
      animalType: editCharacter?.animalType || '',
      furColor: editCharacter?.furColor || '',
    }),
    [editCharacter, visible]
  );

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      const characterData: CreateCharacterInput = {
        name: values.name.trim(),
        type: values.characterType,
        gender: values.gender || undefined,
        description: values.description.trim() || undefined,
        ...(values.characterType === 'HUMAN'
          ? {
            age: values.age ? parseInt(values.age, 10) : undefined,
            skinColor: values.skinColor || undefined,
            hairColor: values.hairColor || undefined,
            eyeColor: values.eyeColor || undefined,
            clothing: values.clothing.trim() || undefined,
          }
          : {
            animalAge: values.animalAge || undefined,
            animalType: values.animalType || undefined,
            furColor: values.furColor || undefined,
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
                props: { emoji: '✏️' },
              });
              onCharacterCreated?.(updatedCharacter);
              onClose();
              formik.resetForm();
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
              props: { emoji: '🎉' },
            });
            onCharacterCreated?.(newCharacter);
            onClose();
            formik.resetForm();
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
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (!editCharacter) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!editCharacter) return;

    deleteCharacterMutation.mutate(editCharacter.id, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: t('character.deleted'),
          text2: t('character.deletedMessage'),
          props: { emoji: '🗑️' },
        });
        setShowDeleteModal(false);
        onCharacterDeleted?.(editCharacter.id);
        onClose();
        formik.resetForm();
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: error instanceof Error ? error.message : t('errors.unknownError'),
        });
      },
    });
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
              {!isEditing && (
                <Text className="text-white/70 text-sm font-baloo text-center mt-2">
                  {t('character.modalSubtitle')}
                </Text>
              )}
            </View>

            {/* Content */}
            <ScrollView ref={scrollViewRef} className="p-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Type selector */}
              <View className="mb-4">
                <Text
                  className={`${isNight ? 'text-white' : 'text-gray-600'} text-sm font-baloo-semibold mb-2`}
                >
                  {t('character.type')}
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => formik.setFieldValue('characterType', 'HUMAN')}
                    className={`flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2 ${formik.values.characterType === 'HUMAN'
                      ? 'bg-blue-500'
                      : isNight
                        ? 'bg-slate-700'
                        : 'bg-gray-200'
                      }`}
                  >
                    <Text
                      className={`font-baloo-semibold ${formik.values.characterType === 'HUMAN'
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
                    onPress={() => formik.setFieldValue('characterType', 'ANIMAL')}
                    className={`flex-1 py-4 rounded-xl flex-row items-center justify-center gap-2 ${formik.values.characterType === 'ANIMAL'
                      ? 'bg-blue-500'
                      : isNight
                        ? 'bg-slate-700'
                        : 'bg-gray-200'
                      }`}
                  >
                    <Text
                      className={`font-baloo-semibold ${formik.values.characterType === 'ANIMAL'
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
                  className={`${isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
                    } rounded-xl p-4 font-baloo ${formik.touched.name && formik.errors.name ? 'border-2 border-red-500' : ''}`}
                  value={formik.values.name}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^\p{L}0-9-]/gu, '');
                    formik.setFieldValue('name', filtered);
                  }}
                  onBlur={() => formik.setFieldTouched('name', true)}
                  placeholder={t('character.namePlaceholder')}
                  placeholderTextColor={isNight ? '#94a3b8' : '#9ca3af'}
                  maxLength={25}
                />
                {formik.touched.name && formik.errors.name && (
                  <Text className="text-red-500 text-sm mt-1 font-baloo">{formik.errors.name}</Text>
                )}
              </View>

              {/* Gender */}
              <OptionSelector
                label={t('character.gender')}
                options={GENDERS.map(g => ({
                  ...g,
                  label: formik.values.characterType === 'ANIMAL'
                    ? (g.id === 'MALE' ? t('character.maleAnimal') : t('character.femaleAnimal'))
                    : (g.id === 'MALE' ? t('character.male') : t('character.female'))
                }))}
                selectedValue={formik.values.gender}
                onSelect={(value) => formik.setFieldValue('gender', value)}
                isNight={isNight}
                errorMessage={formik.touched.gender && formik.errors.gender ? formik.errors.gender : undefined}
              />

              {/* Age - différent selon le type */}
              {formik.values.characterType === 'HUMAN' ? (
                <View className="mb-4">
                  <Text
                    className={`${isNight ? 'text-white' : 'text-gray-600'} text-sm font-baloo-semibold mb-2`}
                  >
                    {t('character.age')}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      className={`${isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
                        } rounded-xl p-4 font-baloo w-24 text-center ${formik.touched.age && formik.errors.age ? 'border-2 border-red-500' : ''}`}
                      value={formik.values.age}
                      onChangeText={(text) => {
                        const digits = text.replace(/[^0-9]/g, '');
                        const num = parseInt(digits, 10);
                        if (digits === '' || num <= 100) {
                          formik.setFieldValue('age', digits);
                        }
                      }}
                      onBlur={() => formik.setFieldTouched('age', true)}
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
                  {formik.touched.age && formik.errors.age && (
                    <Text className="text-red-500 text-sm mt-1 font-baloo">{formik.errors.age}</Text>
                  )}
                </View>
              ) : (
                <OptionSelector
                  label={t('character.animalAgeLabel')}
                  options={ANIMAL_AGE_RANGES}
                  selectedValue={formik.values.animalAge}
                  onSelect={(value) => formik.setFieldValue('animalAge', value)}
                  isNight={isNight}
                  translationKey="character.animalAges"
                  errorMessage={formik.touched.animalAge && formik.errors.animalAge ? formik.errors.animalAge : undefined}
                />
              )}

              {/* Human-specific fields */}
              {formik.values.characterType === 'HUMAN' && (
                <>
                  <OptionSelector
                    label={t('character.skinColor')}
                    options={SKIN_COLORS}
                    selectedValue={formik.values.skinColor}
                    onSelect={(value) => formik.setFieldValue('skinColor', value)}
                    isNight={isNight}
                    translationKey="character.skinColors"
                    errorMessage={formik.touched.skinColor && formik.errors.skinColor ? formik.errors.skinColor : undefined}
                  />

                  <OptionSelector
                    label={t('character.hairColor')}
                    options={HAIR_COLORS}
                    selectedValue={formik.values.hairColor}
                    onSelect={(value) => formik.setFieldValue('hairColor', value)}
                    isNight={isNight}
                    translationKey="character.hairColors"
                    errorMessage={formik.touched.hairColor && formik.errors.hairColor ? formik.errors.hairColor : undefined}
                  />

                  <OptionSelector
                    label={t('character.eyeColor')}
                    options={EYE_COLORS}
                    selectedValue={formik.values.eyeColor}
                    onSelect={(value) => formik.setFieldValue('eyeColor', value)}
                    isNight={isNight}
                    translationKey="character.eyeColors"
                    errorMessage={formik.touched.eyeColor && formik.errors.eyeColor ? formik.errors.eyeColor : undefined}
                  />

                  <View className="mb-4">
                    <Text
                      className={`${isNight ? 'text-white' : 'text-gray-600'} text-sm font-baloo-semibold mb-2`}
                    >
                      {t('character.clothing')}
                    </Text>
                    <TextInput
                      className={`${isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
                        } rounded-xl p-4 font-baloo ${formik.touched.clothing && formik.errors.clothing ? 'border-2 border-red-500' : ''}`}
                      value={formik.values.clothing}
                      onChangeText={(text) => formik.setFieldValue('clothing', text)}
                      onBlur={() => formik.setFieldTouched('clothing', true)}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 300);
                      }}
                      placeholder={t('character.clothingPlaceholder')}
                      placeholderTextColor={isNight ? '#94a3b8' : '#9ca3af'}
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                      maxLength={80}
                    />
                    {formik.touched.clothing && formik.errors.clothing && (
                      <Text className="text-red-500 text-sm mt-1 font-baloo">{formik.errors.clothing}</Text>
                    )}
                  </View>
                </>
              )}

              {/* Animal-specific fields */}
              {formik.values.characterType === 'ANIMAL' && (
                <>
                  <OptionSelector
                    label={t('character.animalType')}
                    options={ANIMAL_TYPES}
                    selectedValue={formik.values.animalType}
                    onSelect={(value) => formik.setFieldValue('animalType', value)}
                    isNight={isNight}
                    translationKey="character.animalTypes"
                    errorMessage={formik.touched.animalType && formik.errors.animalType ? formik.errors.animalType : undefined}
                  />

                  <OptionSelector
                    label={t('character.furColor')}
                    options={FUR_COLORS}
                    selectedValue={formik.values.furColor}
                    onSelect={(value) => formik.setFieldValue('furColor', value)}
                    isNight={isNight}
                    translationKey="character.furColors"
                    errorMessage={formik.touched.furColor && formik.errors.furColor ? formik.errors.furColor : undefined}
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
                  className={`${isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
                    } rounded-xl p-4 font-baloo ${formik.touched.description && formik.errors.description ? 'border-2 border-red-500' : ''}`}
                  value={formik.values.description}
                  onChangeText={(text) => formik.setFieldValue('description', text)}
                  onBlur={() => formik.setFieldTouched('description', true)}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 300);
                  }}
                  placeholder={getDescriptionPlaceholder()}
                  placeholderTextColor={isNight ? '#94a3b8' : '#9ca3af'}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={80}
                  style={{ minHeight: 80 }}
                />
                {formik.touched.description && formik.errors.description && (
                  <Text className="text-red-500 text-sm mt-1 font-baloo">{formik.errors.description}</Text>
                )}
              </View>
            </ScrollView>

            {/* Actions */}
            <View className="p-6 flex flex-row pt-0 gap-3 mt-3">
              <TouchableOpacity
                className={`${isNight ? 'bg-slate-700' : 'bg-gray-200'} px-6 flex-1 py-4 rounded-xl items-center`}
                onPress={handleClose}
                disabled={isPending}
              >
                <Text
                  className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}
                >
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`${isNight ? 'bg-blue-600' : 'bg-[#0D1821]'
                  } px-6 py-4 rounded-xl flex-1 justify-center items-center ${isPending ? 'opacity-50' : ''}`}
                onPress={() => formik.handleSubmit()}
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
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <DeleteCharacterModal
        visible={showDeleteModal}
        character={editCharacter ?? null}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        isPending={deleteCharacterMutation.isPending}
      />
    </Modal>
  );
}
