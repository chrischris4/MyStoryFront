import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, useWindowDimensions, ImageBackground } from 'react-native';
import { Animated } from 'react-native';
import PageSelector from '~/components/PageSelector';
import { useTheme } from '~/context/ThemeContext';
import { BlurView } from 'expo-blur';
import StoryModal from '~/components/StoryModal';
import ConfirmationModal from '~/components/ConfirmationModal';
import { Feather } from '@expo/vector-icons';
import * as Yup from 'yup';
import { useFormik } from 'formik';
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
import StarryBackground from '~/components/StarryBackground';





type StoryPage = {
  page: number;
  text: string;
  imageUrl: string;
};

type StoryStyle = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string[];
  imageUrl: string;
};

const STORY_STYLES: StoryStyle[] = [
  {
    id: 'CLASSIQUE',
    name: 'Classique',
    description: 'Style conte de fées traditionnel',
    emoji: '📚',
    gradient: ['#FFD700', '#FFA500'],
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', // Livre ancien
  },
  {
    id: 'REALIST',
    name: 'Réaliste',
    description: 'Style photo réaliste',
    emoji: '📷',
    gradient: ['#4A90E2', '#357ABD'],
    imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=300&fit=crop', // Photo réaliste
  },
  {
    id: 'MANGA',
    name: 'Manga',
    description: 'Style manga japonais',
    emoji: '🎨',
    gradient: ['#FF6B9D', '#C06C84'],
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=300&fit=crop', // Art manga
  },
];

const createStorySchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .required('Le titre est requis'),
  prompt: Yup.string()
    .min(10, 'Le résumé doit contenir au moins 10 caractères')
    .max(500, 'Le résumé ne peut pas dépasser 500 caractères')
    .required('Le résumé est requis'),
  numPages: Yup.number()
    .min(1, 'Au moins 1 page')
    .max(10, 'Maximum 10 pages')
    .required('Le nombre de pages est requis'),
  selectedStyle: Yup.string()
    .required('Le style est requis'),
});

type CreateStoryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'CreateStory'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function CreateStoryScreen() {
  const navigation = useNavigation<CreateStoryScreenNavigationProp>();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const { isNight } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const storyCoin = useUserStore((state) => state.user?.storyCoin ?? 0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Hook pour la création d'histoire avec React Query
  const createStoryMutation = useCreateStory();

  // Utiliser le store global pour la création d'histoire
  const {
    isCreating,
    loading,
    title: creationTitle,
    storyPages,
    storyId,
    isMinimized,
    startCreation,
    updateProgress,
    close,
    minimize,
    maximize
  } = useStoryCreationStore();

  // Détecter quand l'utilisateur quitte la page et minimiser automatiquement
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // Quand on quitte la page CreateStory
      if (isCreating && !isMinimized) {
        minimize();
      }
    });

    return unsubscribe;
  }, [navigation, isCreating, isMinimized, minimize]);

  // Restaurer la modal en plein écran quand on revient sur la page
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Quand on revient sur la page CreateStory
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
    },
    validationSchema: createStorySchema,
    onSubmit: async (values) => {
      // Fermer la modal de confirmation
      setShowConfirmationModal(false);

      // Démarrer la création dans le store global
      startCreation(values.title);

      try {
        // Utiliser la mutation React Query
        const story = await createStoryMutation.mutateAsync({
          prompt: values.prompt,
          numberOfPages: values.numPages,
          title: values.title,
          style: values.selectedStyle
        });

        // Mettre à jour le store avec les résultats
        updateProgress(story.pages, story.id, false);

      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Erreur lors de la création de l\'histoire.',
        });
        close();
      }
    },
  });

  // Fonction pour gérer le clic sur le bouton de création
  const handleCreateClick = async () => {
    // Valider tous les champs
    const errors = await formik.validateForm();

    // Marquer tous les champs comme touchés pour afficher les erreurs
    formik.setTouched({
      title: true,
      prompt: true,
      numPages: true,
      selectedStyle: true,
    });

    // Si pas d'erreurs, ouvrir la modal de confirmation
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
  const cloudColor = isNight ? '#A0AEC0' : '#FFFFFF';
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';

  return (
    <View className="flex-1 pt-4 px-4 relative" style={{ backgroundColor: skyColor }}>
      {/* Bouton de test pour ouvrir/fermer la StoryModal */}
      <TouchableOpacity
        className="absolute top-4 left-4 z-50 bg-purple-600 rounded-full p-3"
        onPress={() => {
          if (isCreating) {
            close();
          } else {
            startCreation('Histoire de test');
            updateProgress(testStoryPages, 'test-story-id', false);
          }
        }}
      >
        <Feather name={isCreating ? "eye-off" : "eye"} size={24} color="white" />
      </TouchableOpacity>

      {isNight && <StarryBackground starCount={50} />}
      <View
        className='absolute bottom-10 border-4 self-center h-28 rounded-t-full w-[100%] z-0'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      {storyCoin === 0 && (
        <View className='absolute bottom-60 self-center'>
          <View className="bg-white rounded-3xl px-6 py-4 mb-4 relative" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            maxWidth: 280
          }}>
            <Text className="text-base font-baloo-semibold text-center text-gray-800">
              Vous avez besoin de Story Coins pour créer une histoire !
            </Text>
            {/* Petite pointe de la bulle */}
            <View style={{
              position: 'absolute',
              bottom: -10,
              left: '50%',
              marginLeft: -10,
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: 10,
              borderRightWidth: 10,
              borderTopWidth: 10,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: 'white',
            }} />
          </View>
        </View>
      )}
      {storyCoin === 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 50,
            zIndex: 1
          }}
          className="self-center"
        >
          <LottieView
            source={require('../../assets/animations/HappyDog.json')}
            autoPlay
            loop={true}
            style={{ width: 250, height: 250, zIndex: 5 }}
          />
        </Animated.View>
      )}
      <View
        className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-10'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      {storyCoin === 0 && (
        <View className="absolute self-center items-center" style={{ top: '50%', transform: [{ translateY: -50 }], zIndex: 100 }}>
          <TouchableOpacity
            className="bg-white/30 px-6 py-4 rounded-xl flex flex-row gap-2"
            onPress={() => navigation.navigate('BillingScreen')}
          >
            <Text className="text-gray-800 font-baloo-semibold text-center text-base">
              Obtenir des Story Coins
            </Text>
            <Feather name="arrow-right" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      )}
      <Text className={`text-4xl font-baloo-bold pt-10 ${isNight ? "text-white/80" : "text-black"}`}>Creation d'histoire</Text>
      <Text className={`text-xl font-baloo pb-4 ${isNight ? "text-white/80" : "text-slate-600"} `}>Ici, tout deviens possible !</Text>
      <ScrollView
        className="flex-1"
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
                intensity={isNight ? 90 : 50}
                tint={isNight ? "dark" : "light"}
                style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '' }}
              >
                <Text className={`text-2xl font-baloo-semibold mb-2 ${isNight ? "text-white/80" : "text-slate-900"}`}>Titre de l'histoire</Text>

                <TextInput
                  className={`border rounded-lg p-2 ${isNight ? 'border-gray-600 text-white' : 'border-gray-400 text-gray-800'} font-baloo`}
                  placeholder="Ex: Pacha et la forêt magique"
                  placeholderTextColor={isNight ? '#9CA3AF' : '#6B7280'}
                  value={formik.values.title}
                  onChangeText={formik.handleChange('title')}
                  onBlur={formik.handleBlur('title')}
                />
                {formik.touched.title && formik.errors.title && (
                  <Text className="text-red-500 text-sm mt-1">{formik.errors.title}</Text>
                )}
              </BlurView>
            </View>

            {/* 🟢 Bloc Résumé */}
            <View
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <BlurView
                intensity={isNight ? 90 : 50}
                tint={isNight ? "dark" : "light"}
                style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '' }}
              >
                <Text className={` ${isNight ? "text-white/80" : "text-slate-900"} text-2xl font-baloo-semibold `}>Résumé de l'histoire</Text>
                <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-sm font-baloo mb-4`}>Résume au mieux ton histoire, les personnages, l'endroit où se passe l'histoire, plus tu apportera de détails à ton résumer et plus l'histoire correspondra à tes attentes !</Text>
                <TextInput
                  className={`border rounded-lg p-3 ${isNight ? 'border-gray-600 text-white' : 'border-gray-400 text-gray-800'} font-baloo`}
                  placeholder="Ex: Une aventure magique dans les montagnes où un jeune garçon découvre un monde secret..."
                  placeholderTextColor={isNight ? '#9CA3AF' : '#6B7280'}
                  value={formik.values.prompt}
                  onChangeText={formik.handleChange('prompt')}
                  onBlur={formik.handleBlur('prompt')}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  style={{ minHeight: 120 }}
                />
                <View className='flex flex-row gap-2'>
                  <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-sm mt-1`}>{formik.values.prompt.length}/500</Text>
                  {formik.touched.prompt && formik.errors.prompt && (
                    <Text className="text-red-500 text-sm mt-1">{formik.errors.prompt}</Text>
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
                intensity={isNight ? 90 : 50}
                tint={isNight ? "dark" : "light"}
                style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '' }}
              >
                <Text className={` ${isNight ? "text-white/80" : "text-slate-900"} text-2xl font-baloo-semibold mb-4`}>Style de l'histoire</Text>

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
                        className="h-40"
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
                          <View
                            style={{
                              padding: 20,
                              borderRadius: 16,
                              backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay sombre pour rendre le texte lisible
                            }}
                            className='justify-between flex flex-col relative h-full w-full'
                          >

                            {isSelected && (
                              <View className="bg-green-500 absolute top-4 right-4 rounded-full w-8 h-8 items-center justify-center">
                                <Text className="text-white font-baloo-bold text-lg">✓</Text>
                              </View>
                            )}
                            <Text
                              className="font-bold text-xl mb-2 text-white"
                            >
                              {style.name}
                            </Text>


                            <Text className="text-white text-sm">
                              {style.description}
                            </Text>
                          </View>
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
                  <Text className="text-red-500 text-sm mt-2 text-center">{formik.errors.selectedStyle}</Text>
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
                intensity={isNight ? 90 : 50}
                tint={isNight ? "dark" : "light"}
                style={{ padding: 16, backgroundColor: isNight ? '#1e293b90' : '' }}
              >
                <PageSelector
                  isNight={isNight}
                  numPages={formik.values.numPages}
                  setNumPages={(n) => formik.setFieldValue('numPages', n)}
                />
                {formik.touched.numPages && formik.errors.numPages && (
                  <Text className="text-red-500 text-sm mt-1 text-center">{formik.errors.numPages}</Text>
                )}
              </BlurView>
            </View>

            {/* Messages d'erreur résumés */}
            {(formik.touched.title || formik.touched.prompt || formik.touched.numPages || formik.touched.selectedStyle) &&
              (formik.errors.title || formik.errors.prompt || formik.errors.numPages || formik.errors.selectedStyle) && (
                <View className={` ${isNight ? 'bg-red-400/30 border-red-400' : 'bg-red-400/20 border-red-600'} border mb-4 rounded-2xl p-4`}>
                  <Text className={` ${isNight ? 'text-white/80' : ''} font-baloo-semibold text-base mb-2`}>Informations manquantes</Text>
                  <View className="gap-1">
                    {formik.touched.title && formik.errors.title && (
                      <Text className={` ${isNight ? 'text-white/80' : 'text-red-600'} text-sm`}>• {formik.errors.title}</Text>
                    )}
                    {formik.touched.prompt && formik.errors.prompt && (
                      <Text className={` ${isNight ? 'text-white/80' : 'text-red-600'} text-sm`}>• {formik.errors.prompt}</Text>
                    )}
                    {formik.touched.numPages && formik.errors.numPages && (
                      <Text className={` ${isNight ? 'text-white/80' : 'text-red-600'} text-sm`}>• {formik.errors.numPages}</Text>
                    )}
                    {formik.touched.selectedStyle && formik.errors.selectedStyle && (
                      <Text className={` ${isNight ? 'text-white/80' : 'text-red-600'} text-sm`}>• {formik.errors.selectedStyle}</Text>
                    )}
                  </View>
                </View>
              )}

            {/* 🖋️ Bouton */}
            <TouchableOpacity
              className={`bg-black px-4 py-3 rounded-3xl items-center`}
              onPress={handleCreateClick}
            >
              <Text className="font-baloo-semibold text-lg text-white">Créer mon histoire !</Text>
            </TouchableOpacity>
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
        styleName={STORY_STYLES.find(s => s.id === formik.values.selectedStyle)?.name || ''}
        styleEmoji={STORY_STYLES.find(s => s.id === formik.values.selectedStyle)?.emoji || ''}
        onConfirm={() => formik.handleSubmit()}
        onCancel={() => setShowConfirmationModal(false)}
      />

      {/* Modal de résultat */}
      {isCreating && !isMinimized && (
        <StoryModal
          loading={loading}
          title={creationTitle || formik.values.title}
          storyPages={storyPages}
          storyId={storyId}
          onClose={() => close()}
        />
      )}
    </View>
  );
}
