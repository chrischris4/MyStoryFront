import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, useWindowDimensions, ImageBackground } from 'react-native';
import { Animated } from 'react-native';
import PageSelector from '~/components/PageSelector';
import { useTheme } from '~/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import StoryModal from '~/components/StoryModal';
import ConfirmationModal from '~/components/ConfirmationModal';
import { Feather } from '@expo/vector-icons';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { containsProfanity } from '~/utils/profanityFilter';
import { useUserStore } from '~/store/useUserStore';
import { useStoryCreationStore } from '~/store/useStoryCreationStore';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '~/types';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import { useCreateStory } from '~/hooks/useCreateStory';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';
import { useTranslation } from 'react-i18next';
import Background from '~/components/Background';
import CharacterSection from '~/components/CharacterSection';
import CharacterModal from '~/components/CharacterModal';
import type { Character } from '~/types';
import { SKIN_COLORS, HAIR_COLORS, EYE_COLORS, ANIMAL_TYPES, FUR_COLORS, GENDERS, ANIMAL_AGE_RANGES } from '~/types';

type StoryPage = {
  page: number;
  text: string;
  imageUrl: string;
};

type StoryStyle = {
  id: string;
  name: string;
  description: string;
  gradient: string[];
  imageUrl: string;
};

type Language = {
  id: string;
  name: string;
  flag: string;
};

const LANGUAGES: Language[] = [
  { id: 'fr', name: 'fr', flag: '🇫🇷' },
  { id: 'en', name: 'en', flag: '🇬🇧' },
  { id: 'es', name: 'es', flag: '🇪🇸' },
  { id: 'de', name: 'de', flag: '🇩🇪' },
  // { id: 'it', name: 'it', flag: '🇮🇹' },
  // { id: 'pt', name: 'pt', flag: '🇵🇹' },
  { id: 'da', name: 'da', flag: '🇩🇰' },
];

type AgeGroup = {
  id: string;
  emoji: string;
  ageRange: string;
  maxChars: number;
};

const AGE_GROUPS: AgeGroup[] = [
  { id: 'TODDLER', emoji: '👶', ageRange: '2-3', maxChars: 50 },
  { id: 'PRESCHOOL', emoji: '🧒', ageRange: '4-5', maxChars: 80 },
  { id: 'EARLY_SCHOOL', emoji: '📚', ageRange: '6-7', maxChars: 100 },
  { id: 'SCHOOL', emoji: '🎓', ageRange: '8+', maxChars: 120 },
];

const STORY_STYLES: StoryStyle[] = [
  {
    id: 'CLASSIQUE',
    name: 'Classique',
    description: 'Style conte de fées traditionnel',
    gradient: ['#FFD700', '#FFA500'],
    imageUrl: 'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_23/page_1.webp', // Livre ancien
  },
  {
    id: 'WATERCOLOR',
    name: 'Aquarelle',
    description: 'Style aquarelle doux et poétique',
    gradient: ['#7DD3FC', '#A78BFA'],
    imageUrl: 'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_22/cover.webp', // Aquarelle
  },
  {
    id: 'MANGA',
    name: 'Manga',
    description: 'Style manga japonais',
    gradient: ['#FF6B9D', '#C06C84'],
    imageUrl: 'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_19/cover.webp', // Art manga
  },
];

const createStorySchema = (t: (key: string) => string) => Yup.object().shape({
  title: Yup.string()
    .min(3, t('createStory.validation.titleMin'))
    .max(40, t('createStory.validation.titleMax'))
    .required(t('createStory.validation.titleRequired'))
    .test('no-profanity', t('validation.profanity'), (value) => !value || !containsProfanity(value)),
  prompt: Yup.string()
    .min(10, t('createStory.validation.promptMin'))
    .max(500, t('createStory.validation.promptMax'))
    .required(t('createStory.validation.promptRequired'))
    .test('no-profanity', t('validation.profanity'), (value) => !value || !containsProfanity(value)),
  numPages: Yup.number()
    .min(1, t('createStory.validation.pagesMin'))
    .max(12, t('createStory.validation.pagesMax'))
    .required(t('createStory.validation.pagesRequired')),
  selectedStyle: Yup.string()
    .required(t('createStory.validation.styleRequired')),
  language: Yup.string()
    .required(t('createStory.validation.languageRequired')),
  ageGroup: Yup.string()
    .required(t('createStory.validation.ageGroupRequired')),
});

type CreateStoryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'CreateStory'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function CreateStoryScreen() {
  const navigation = useNavigation<CreateStoryScreenNavigationProp>();
  const { t } = useTranslation();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const { isNight } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const storyCoin = useUserStore((state) => state.user?.storyCoin ?? 0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const createStoryMutation = useCreateStory();
  const queryClient = useQueryClient();
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const {
    isCreating,
    loading,
    title: creationTitle,
    description: creationDescription,
    coverUrl: creationCoverUrl,
    storyPages,
    storyId,
    isMinimized,
    startCreation,
    updateProgress,
    close,
    minimize,
    maximize
  } = useStoryCreationStore();

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (isCreating && !isMinimized) {
        minimize();
      }
    });

    return unsubscribe;
  }, [navigation, isCreating, isMinimized, minimize]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isCreating && isMinimized) {
        maximize();
      }
    });

    return unsubscribe;
  }, [navigation, isCreating, isMinimized, maximize]);

  // Données de test pour le bouton de test
  const testStoryPages: StoryPage[] = [
    {
      page: 1,
      text: 'Il était une fois, dans une forêt magique, un petit renard nommé Roux qui rêvait de découvrir le monde.',
      imageUrl: 'https://picsum.photos/400/600?random=1'
    },
    {
      page: 2,
      text: 'Un jour, il rencontra une chouette sage qui lui révéla l\'existence d\'un trésor caché au sommet de la montagne.',
      imageUrl: 'https://picsum.photos/400/600?random=2'
    },
    {
      page: 3,
      text: 'Roux se mit en route, traversant des rivières et des vallées, faisant de nouvelles rencontres à chaque étape.',
      imageUrl: 'https://picsum.photos/400/600?random=3'
    }
  ];

  const formik = useFormik({
    initialValues: {
      title: '',
      prompt: '',
      numPages: 6,
      selectedStyle: 'CLASSIQUE',
      language: 'fr',
      ageGroup: 'PRESCHOOL',
    },
    validationSchema: createStorySchema(t),
    onSubmit: async (values) => {
      setShowConfirmationModal(false);
      startCreation(values.title);

      try {
        const payload = {
          prompt: values.prompt,
          numberOfPages: values.numPages,
          title: values.title,
          style: values.selectedStyle,
          language: values.language,
          ageGroup: values.ageGroup,
          characterIds: selectedCharacters.map((c) => c.id),
          characterDescriptions: selectedCharacters.length > 0
            ? selectedCharacters.map((c) => buildCharacterDescription(c))
            : undefined,
        };
        const result = await createStoryMutation.mutateAsync(payload);
        const { storyId: newStoryId } = result;

        // Polling du status toutes les 3 secondes
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await api.getStoryStatus(newStoryId);

            if (statusRes.status === 'COMPLETED') {
              clearInterval(pollInterval);
              // Charger la story complète
              const fullStory = await api.getStoryDetail(newStoryId);
              updateProgress(
                fullStory.pages ?? [],
                fullStory.id?.toString() ?? null,
                fullStory.coverUrl ?? null,
                fullStory.description ?? null,
                false
              );
              // Rafraîchir la liste des stories
              queryClient.invalidateQueries({ queryKey: ['stories'] });
            }

            if (statusRes.status === 'FAILED') {
              clearInterval(pollInterval);
              Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: statusRes.failureReason || t('createStory.creationError'),
              });
              close();
            }
          } catch (pollError) {
            console.error('❌ Erreur polling:', pollError);
            clearInterval(pollInterval);
            Toast.show({
              type: 'error',
              text1: t('common.error'),
              text2: t('createStory.creationError'),
            });
            close();
          }
        }, 3000);

      } catch (error) {
        console.error('❌ Erreur création:', error);
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('createStory.creationError'),
        });
        close();
      }
    },
  });

  // Fonction pour construire la description du personnage pour l'IA
  const buildCharacterDescription = (character: Character): string => {
    let description = `Personnage principal: ${character.name}`;

    const genderLabel = GENDERS.find((g) => g.id === character.gender)?.label;
    if (genderLabel) description += `, ${genderLabel.toLowerCase()}`;

    if (character.type === 'HUMAN') {
      if (character.age) description += `, ${character.age} ans`;
      const skinLabel = SKIN_COLORS.find((s) => s.id === character.skinColor)?.label || character.skinColor;
      if (skinLabel) description += `, peau ${skinLabel.toLowerCase()}`;
      const hairLabel = HAIR_COLORS.find((h) => h.id === character.hairColor)?.label || character.hairColor;
      if (hairLabel) description += `, cheveux ${hairLabel.toLowerCase()}`;
      const eyeLabel = EYE_COLORS.find((e) => e.id === character.eyeColor)?.label || character.eyeColor;
      if (eyeLabel) description += `, yeux ${eyeLabel.toLowerCase()}`;
      if (character.clothing) description += `. Vêtements: ${character.clothing}`;
    } else {
      const animalLabel = ANIMAL_TYPES.find((a) => a.id === character.animalType)?.label || character.animalType;
      if (animalLabel) description += `, un ${animalLabel.toLowerCase()}`;
      const ageLabel = ANIMAL_AGE_RANGES.find((a) => a.id === character.animalAge)?.label;
      if (ageLabel) description += ` ${ageLabel.toLowerCase()}`;
      const furLabel = FUR_COLORS.find((f) => f.id === character.furColor)?.label || character.furColor;
      if (furLabel) description += `, pelage ${furLabel.toLowerCase()}`;
    }

    if (character.description) {
      description += `. ${character.description}`;
    }

    return description;
  };

  const handleCreateClick = async () => {
    const errors = await formik.validateForm();

    formik.setTouched({
      title: true,
      prompt: true,
      numPages: true,
      selectedStyle: true,
      language: true,
      ageGroup: true,
    });

    if (Object.keys(errors).length === 0) {
      setShowConfirmationModal(true);
    }
  };



  const animationRef = useRef(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  const translateX = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    animationRef.current?.play();

    Animated.timing(translateX, {
      toValue: -300,
      duration: 5000,
      useNativeDriver: true,
    }).start();
  }, []);

  const skyColor = isNight ? '#020205' : '#87CEEB';
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';

  const getStyleTranslation = (styleId: string) => {
    const translations: Record<string, { name: string; description: string }> = {
      CLASSIQUE: { name: t('createStory.styleClassic'), description: t('createStory.styleClassicDesc') },
      WATERCOLOR: { name: t('createStory.styleWatercolor'), description: t('createStory.styleWatercolorDesc') },
      MANGA: { name: t('createStory.styleManga'), description: t('createStory.styleMangaDesc') },
    };
    return translations[styleId] || { name: styleId, description: '' };
  };

  return (
    <View className="flex-1 pt-4 relative" style={{ backgroundColor: skyColor }}>
      {/* 🌤️ Background animé */}
      <Background isNight={isNight} />
      {/* <TouchableOpacity
        className="absolute top-4 left-4 z-50 bg-purple-600 rounded-full p-3"
        onPress={() => {
          if (isCreating) {
            close();
          } else {
            startCreation('Histoire de test');
            updateProgress(testStoryPages, 'test-story-id', 'https://example.com/test-cover.jpg', 'Description de test', false);
          }
        }}
      >
        <Feather name={isCreating ? "eye-off" : "eye"} size={24} color="white" />
      </TouchableOpacity> */}
      <View
        pointerEvents="none"
        className='absolute bottom-0 -right-20 border-4 h-36 rounded-tl-full w-[100%] z-20'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      {storyCoin === 0 && (
        <>
          <Animated.View
            className="absolute bottom-60 right-24 z-40"
            style={{ opacity: bubbleOpacity }}
          >
            <View
              className="px-4 py-3 flex w-72 rounded-2xl bg-white text-black"
            >
              <Text className="font-baloo-medium md:text-lg text-center">
                {t('sharedStories.storeBubble')}
              </Text>
            </View>
            {/* Petite flèche de la bulle */}
            <View
              style={{
                position: 'absolute',
                bottom: -10,
                right: 20,
                width: 0,
                height: 0,
                borderLeftWidth: 10,
                borderRightWidth: 10,
                borderTopWidth: 12,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: 'white',
              }}
            />
          </Animated.View>
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 110,
              right: 50,
            }}
          >
            <LottieView
              ref={animationRef}
              source={require('../../assets/animations/tree.json')}
              autoPlay
              loop={false}
              style={{ width: 200, height: 200 }}
            />
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              bottom: 65,
              right: -15,
              zIndex: 10
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('BillingScreen')}
              activeOpacity={0.8}
            >
              <LottieView
                source={require('../../assets/animations/Store.json')}
                autoPlay
                loop={false}
                style={{ width: 200, height: 200 }}
              />
            </TouchableOpacity>
          </Animated.View>
          <View className="absolute self-center items-center" style={{ top: '50%', transform: [{ translateY: -50 }], zIndex: 10 }}>
            <TouchableOpacity
              className="bg-white/30 px-6 py-4 rounded-xl flex flex-row gap-2"
              onPress={() => navigation.navigate('BillingScreen')}
            >
              <Text className="text-gray-800 font-baloo-semibold text-center text-base md:text-lg">
                {t('createStory.getStoryCoins')}
              </Text>
              <Feather name="arrow-right" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </>
      )}

      <Text className={`text-4xl md:text-5xl font-baloo-bold pt-10 px-4 md:px-8 ${isNight ? "text-white" : "text-black"}`}>{t('createStory.title')}</Text>
      <Text className={`text-xl md:text-2xl font-baloo pb-4 px-4 md:px-8 ${isNight ? "text-white" : "text-slate-600"} `}>{t('createStory.subtitle')}</Text>
      <ScrollView
        className="flex-1 px-4 md:px-8 z-20"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {storyCoin > 0 && (
          <View>
            {/* 🟣 Bloc Titre */}
            <View
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <BlurView
                intensity={90}
                tint={isNight ? "dark" : "light"}
                style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
              >
                <Text className={`text-2xl md:text-3xl font-baloo-semibold mb-2 ${isNight ? "text-white" : "text-slate-900"}`}>{t('createStory.storyTitle')}</Text>
                <TextInput
                  className={`border rounded-lg p-2 ${isNight ? 'border-gray-600 text-white' : 'border-gray-400 text-gray-800'} font-baloo`}
                  placeholder={t('createStory.storyTitlePlaceholder')}
                  placeholderTextColor={isNight ? '#9CA3AF' : '#6B7280'}
                  value={formik.values.title}
                  onChangeText={formik.handleChange('title')}
                  onBlur={formik.handleBlur('title')}
                  maxLength={40}
                />
                <View className='flex flex-row gap-2'>
                  <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-sm md:text-base mt-1`}>{formik.values.title.length}/40</Text>
                  {formik.touched.title && formik.errors.title && (
                    <Text className="text-red-500 text-sm md:text-base mt-1">{formik.errors.title}</Text>
                  )}
                </View>
              </BlurView>
            </View>

            {/* 👤 Bloc Personnage */}
            <CharacterSection
              isNight={isNight}
              selectedCharacters={selectedCharacters}
              onCharactersChange={setSelectedCharacters}
              onCreateNew={() => {
                setEditingCharacter(null);
                setShowCharacterModal(true);
              }}
              onEditCharacter={(character) => {
                setEditingCharacter(character);
                setShowCharacterModal(true);
              }}
            />

            {/* 🟢 Bloc Résumé */}
            <View
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <BlurView
                intensity={90}
                tint={isNight ? "dark" : "light"}
                style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
              >
                <Text className={` ${isNight ? "text-white" : "text-slate-900"} text-2xl md:text-3xl font-baloo-semibold `}>{t('createStory.storySummary')}</Text>
                <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-sm md:text-base font-baloo mb-4`}>{t('createStory.storySummaryDesc')}</Text>
                <TextInput
                  className={`border rounded-lg p-3 ${isNight ? 'border-gray-600 text-white' : 'border-gray-400 text-gray-800'} font-baloo`}
                  placeholder={(() => {
                    if (selectedCharacters.length === 2) {
                      return t('createStory.storySummaryPlaceholderPlural', {
                        name: `${selectedCharacters[0].name} ${t('common.and')} ${selectedCharacters[1].name}`,
                      });
                    }
                    const char = selectedCharacters[0];
                    const isMale = char ? char.gender === 'MALE' : false;
                    const key = isMale ? 'storySummaryPlaceholderMale' : 'storySummaryPlaceholderFemale';
                    return t(`createStory.${key}`, { name: char?.name || 'Mimi' });
                  })()}
                  placeholderTextColor={isNight ? '#9CA3AF' : '#6B7280'}
                  value={formik.values.prompt}
                  onChangeText={formik.handleChange('prompt')}
                  onBlur={formik.handleBlur('prompt')}
                  multiline
                  autoCorrect={true}
                  spellCheck={true}
                  textAlignVertical="top"
                  maxLength={500}
                  style={{ minHeight: 160 }}
                />
                <View className='flex flex-row gap-2'>
                  <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-sm md:text-base mt-1`}>{formik.values.prompt.length}/500</Text>
                  {formik.touched.prompt && formik.errors.prompt && (
                    <Text className="text-red-500 text-sm md:text-base mt-1">{formik.errors.prompt}</Text>
                  )}
                </View>
              </BlurView>
            </View>

            {/* 🟢 Bloc Style */}
            <View
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <BlurView
                intensity={90}
                tint={isNight ? "dark" : "light"}
                style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
              >
                <Text className={` ${isNight ? "text-white" : "text-slate-900"} text-2xl md:text-3xl font-baloo-semibold mb-4`}>{t('createStory.storyStyle')}</Text>

                {/* Carrousel de styles */}
                <Animated.ScrollView
                  ref={scrollViewRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={screenWidth * 0.6}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingRight: 16 }}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                >
                  {STORY_STYLES.map((style) => {
                    const isSelected = formik.values.selectedStyle === style.id;
                    return (
                      <TouchableOpacity
                        activeOpacity={1}
                        key={style.id}
                        onPress={() => formik.setFieldValue('selectedStyle', style.id)}
                        style={{
                          width: screenWidth * 0.6,
                          marginRight: 12,
                          borderRadius: 22,
                          overflow: 'hidden',
                          borderWidth: isSelected ? 4 : 0,
                          borderColor: isSelected ? '#10B981' : 'transparent',
                        }}
                        className="h-40 md:h-60"
                      >
                        <ImageBackground
                          source={{ uri: style.imageUrl }}
                          style={{
                            borderRadius: 16,
                            overflow: 'hidden',
                          }}
                          imageStyle={{ borderRadius: 16 }}
                          className='h-full w-full'
                        >
                          <LinearGradient
                            colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
                            style={{
                              padding: 16,
                              borderRadius: 16,
                              flex: 1,
                              justifyContent: 'flex-end',
                            }}
                          >

                            {isSelected && (
                              <View className="bg-green-500 absolute top-4 right-4 rounded-full w-8 h-8 items-center justify-center">
                                <Text className="text-white font-baloo-bold text-lg">✓</Text>
                              </View>
                            )}
                            <Text
                              className="font-bold text-xl md:text-2xl mb-1 text-white"
                            >
                              {getStyleTranslation(style.id).name}
                            </Text>


                            <Text className="text-white text-sm md:text-base">
                              {getStyleTranslation(style.id).description}
                            </Text>
                          </LinearGradient>
                        </ImageBackground>
                      </TouchableOpacity>
                    );
                  })}
                </Animated.ScrollView>

                {/* Indicateurs de style */}
                <View className="flex-row justify-center mt-4 gap-2">
                  {STORY_STYLES.map((style, index) => {
                    const cardWidth = screenWidth * 0.6 + 12;

                    const inputRange = [
                      (index - 1) * cardWidth,
                      index * cardWidth,
                      (index + 1) * cardWidth,
                    ];

                    const dotWidth = scrollX.interpolate({
                      inputRange,
                      outputRange: [8, 24, 8],
                      extrapolate: 'clamp',
                    });

                    const dotColor = scrollX.interpolate({
                      inputRange,
                      outputRange: ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.4)'],
                      extrapolate: 'clamp',
                    });

                    return (
                      <Animated.View
                        key={`dot-${style.id}`}
                        className="rounded-full"
                        style={{
                          width: dotWidth,
                          height: 8,
                          backgroundColor: dotColor,
                        }}
                      />
                    );
                  })}
                </View>
                {formik.touched.selectedStyle && formik.errors.selectedStyle && (
                  <Text className="text-red-500 text-sm md:text-base mt-2 text-center">{formik.errors.selectedStyle}</Text>
                )}
              </BlurView>
            </View>

            {/* 🌍 Bloc Langue */}
            <View
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <BlurView
                intensity={90}
                tint={isNight ? "dark" : "light"}
                style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
              >
                <Text className={` ${isNight ? "text-white" : "text-slate-900"} text-2xl md:text-3xl font-baloo-semibold mb-4`}>{t('createStory.storyLanguage')}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const isSelected = formik.values.language === lang.id;
                    return (
                      <TouchableOpacity
                        key={lang.id}
                        onPress={() => formik.setFieldValue('language', lang.id)}
                        className={`px-4 py-2 rounded-xl flex-row items-center gap-2 ${isSelected ? 'bg-green-500' : isNight ? 'bg-white/10' : 'bg-black/10'}`}
                      >
                        <Text className="text-xl md:text-2xl">{lang.flag}</Text>
                        <Text className={`font-baloo-medium md:text-lg ${isSelected ? 'text-white' : isNight ? 'text-white/80' : 'text-slate-800'}`}>
                          {t(`storyFolder.languages.${lang.id}`, lang.name)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {formik.touched.language && formik.errors.language && (
                  <Text className="text-red-500 text-sm md:text-base mt-2">{formik.errors.language}</Text>
                )}
              </BlurView>
            </View>

            {/* 👶 Bloc Tranche d'âge */}
            <View
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <BlurView
                intensity={90}
                tint={isNight ? "dark" : "light"}
                style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
              >
                <Text className={` ${isNight ? "text-white" : "text-slate-900"} text-2xl md:text-3xl font-baloo-semibold`}>{t('createStory.ageGroup')}</Text>
                <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-sm md:text-base font-baloo mb-4`}>{t('createStory.ageGroupDesc')}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {AGE_GROUPS.map((age) => {
                    const isSelected = formik.values.ageGroup === age.id;
                    return (
                      <TouchableOpacity
                        key={age.id}
                        onPress={() => formik.setFieldValue('ageGroup', age.id)}
                        className={`px-4 py-3 rounded-xl flex-1 min-w-[45%] ${isSelected ? 'bg-green-500' : isNight ? 'bg-white/10' : 'bg-black/10'}`}
                      >
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-xl md:text-2xl">{age.emoji}</Text>
                          <Text className={`font-baloo-semibold md:text-lg ${isSelected ? 'text-white' : isNight ? 'text-white' : 'text-slate-800'}`}>
                            {t(`createStory.ageGroups.${age.id}.name`)}
                          </Text>
                        </View>
                        <Text className={`text-xs md:text-sm ${isSelected ? 'text-white/90' : isNight ? 'text-white/60' : 'text-slate-600'}`}>
                          {t(`createStory.ageGroups.${age.id}.desc`)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {formik.touched.ageGroup && formik.errors.ageGroup && (
                  <Text className="text-red-500 text-sm md:text-base mt-2">{formik.errors.ageGroup}</Text>
                )}
              </BlurView>
            </View>

            {/* 🧡 Sélecteur de pages */}
            <View
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <BlurView
                intensity={90}
                tint={isNight ? "dark" : "light"}
                style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
              >
                <PageSelector
                  isNight={isNight}
                  numPages={formik.values.numPages}
                  setNumPages={(n) => formik.setFieldValue('numPages', n)}
                />
                {formik.touched.numPages && formik.errors.numPages && (
                  <Text className="text-red-500 text-sm md:text-base mt-1 text-center">{formik.errors.numPages}</Text>
                )}
              </BlurView>
            </View>

            {/* Messages d'erreur résumés */}
            {(formik.touched.title || formik.touched.prompt || formik.touched.numPages || formik.touched.selectedStyle || formik.touched.language || formik.touched.ageGroup) &&
              (formik.errors.title || formik.errors.prompt || formik.errors.numPages || formik.errors.selectedStyle || formik.errors.language || formik.errors.ageGroup) && (
                <View className={` ${isNight ? 'bg-red-400/30 border-red-400' : 'bg-red-400/20 border-red-600'} border mb-4 rounded-2xl p-4`}>
                  <Text className={` ${isNight ? 'text-white/80' : ''} font-baloo-semibold text-base md:text-lg mb-2`}>{t('createStory.missingInfo')}</Text>
                  <View className="gap-1">
                    {formik.touched.title && formik.errors.title && (
                      <Text className={` ${isNight ? 'text-white/80' : 'text-black'} text-sm md:text-base`}>• {formik.errors.title}</Text>
                    )}
                    {formik.touched.prompt && formik.errors.prompt && (
                      <Text className={` ${isNight ? 'text-white/80' : 'text-black'} text-sm md:text-base`}>• {formik.errors.prompt}</Text>
                    )}
                    {formik.touched.numPages && formik.errors.numPages && (
                      <Text className={` ${isNight ? 'text-white/80' : 'text-black'} text-sm md:text-base`}>• {formik.errors.numPages}</Text>
                    )}
                    {formik.touched.selectedStyle && formik.errors.selectedStyle && (
                      <Text className={` ${isNight ? 'text-white/80' : 'text-black'} text-sm md:text-base`}>• {formik.errors.selectedStyle}</Text>
                    )}
                    {formik.touched.language && formik.errors.language && (
                      <Text className={` ${isNight ? 'text-white/80' : 'text-black'} text-sm md:text-base`}>• {formik.errors.language}</Text>
                    )}
                    {formik.touched.ageGroup && formik.errors.ageGroup && (
                      <Text className={` ${isNight ? 'text-white/80' : 'text-black'} text-sm md:text-base`}>• {formik.errors.ageGroup}</Text>
                    )}
                  </View>
                </View>
              )}
            <BlurView intensity={90}
              tint={isNight ? 'dark' : 'light'} style={{
                borderRadius: 24,
                overflow: 'hidden'
              }}
              className='w-11/12 mx-auto'>
              <TouchableOpacity activeOpacity={0.8} style={{
                padding: 12,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8, backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'
              }}
                onPress={handleCreateClick}
              >
                <Text className={`${isNight ? "text-white" : "text-slate-700"} font-baloo-medium text-xl`}>{t('createStory.createMyStory')}</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        )}
      </ScrollView>



      {/* /////////////////MODAL/////////////////////////////////////////////////// */}

      {/* Modal de confirmation */}
      <ConfirmationModal
        visible={showConfirmationModal}
        title={formik.values.title}
        prompt={formik.values.prompt}
        numPages={formik.values.numPages}
        styleName={getStyleTranslation(formik.values.selectedStyle).name}
        styleEmoji={STORY_STYLES.find(s => s.id === formik.values.selectedStyle) || ''}
        languageName={t(`storyFolder.languages.${formik.values.language}`, LANGUAGES.find(l => l.id === formik.values.language)?.name || '')}
        languageFlag={LANGUAGES.find(l => l.id === formik.values.language)?.flag || ''}
        ageGroupName={t(`createStory.ageGroups.${formik.values.ageGroup}.name`)}
        ageGroupEmoji={AGE_GROUPS.find(a => a.id === formik.values.ageGroup)?.emoji || ''}
        characters={selectedCharacters}
        onConfirm={() => formik.handleSubmit()}
        onCancel={() => setShowConfirmationModal(false)}
      />

      {/* Modal de résultat */}
      {isCreating && !isMinimized && (
        <StoryModal
          loading={loading}
          title={creationTitle || formik.values.title}
          description={creationDescription}
          coverUrl={creationCoverUrl}
          storyPages={storyPages}
          storyId={storyId}
          onClose={() => close()}
        />
      )}

      {/* Modal de création/édition de personnage */}
      <CharacterModal
        visible={showCharacterModal}
        onClose={() => {
          setShowCharacterModal(false);
          setEditingCharacter(null);
        }}
        editCharacter={editingCharacter}
        onCharacterCreated={(character) => {
          // Ajouter le personnage créé s'il y a de la place
          if (selectedCharacters.length < 2) {
            setSelectedCharacters([...selectedCharacters, character]);
          }
        }}
      />
    </View>
  );
}
