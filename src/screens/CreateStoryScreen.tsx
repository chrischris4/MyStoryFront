import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
};

const STORY_STYLES: StoryStyle[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Style conte de fées traditionnel',
    emoji: '📚',
    gradient: ['#FFD700', '#FFA500'],
  },
  {
    id: 'realistic',
    name: 'Réaliste',
    description: 'Style photo réaliste',
    emoji: '📷',
    gradient: ['#4A90E2', '#357ABD'],
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    description: 'Style dessin animé coloré',
    emoji: '🎨',
    gradient: ['#FF6B9D', '#C06C84'],
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
  const scrollViewRef = useRef<ScrollView>(null);
  const storyCoin = useUserStore((state) => state.user?.storyCoin ?? 0);

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
      numPages: 1,
      selectedStyle: 'classic',
    },
    validationSchema: createStorySchema,
    onSubmit: async (values) => {
      // Fermer la modal de confirmation
      setShowConfirmationModal(false);

      // Démarrer la création dans le store global
      startCreation(values.title);

      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('Utilisateur non connecté');

        const body = {
          prompt: values.prompt,
          numberOfPages: values.numPages,
          title: values.title,
          style: values.selectedStyle
        };

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/story/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        const text = await response.text();

        if (!response.ok) {
          throw new Error('Erreur lors de la création de l\'histoire');
        }

        const story = JSON.parse(text);

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

  const translateX = useRef(new Animated.Value(Dimensions.get('window').width)).current;

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

  const renderStars = (count: number) => {
    const stars = [];
    const { width, height } = Dimensions.get('window');

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2 + 1; // taille entre 1 et 3
      const top = Math.random() * (height * 0.5); // moitié supérieure de l'écran
      const left = Math.random() * width;
      const opacity = Math.random() * 0.8 + 0.2; // variation d'opacité

      stars.push(
        <View
          key={`star-${i}`}
          style={{
            position: 'absolute',
            top,
            left,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#FFFFFF',
            opacity,
          }}
        />
      );
    }

    return stars;
  };

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

      {isNight && renderStars(50)}
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
      <Text className="text-4xl font-baloo-bold pb-2 pt-8">Creation d'histoire</Text>
      <Text className="text-lg font-baloo pb-2">Ici, tout deviens possible !</Text>
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
                intensity={50}
                tint='light'
                style={{ padding: 16 }}
              >
                <Text className="text-lg font-baloo-semibold mb-2">Titre de l'histoire</Text>
                <TextInput
                  className="border border-gray-400 rounded-lg p-2"
                  placeholder="Ex: Pacha et la forêt magique"
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
                intensity={50}
                tint='light'
                style={{ padding: 16 }}
              >
                <Text className="text-lg font-baloo-semibold mb-2">Résumé de l'histoire</Text>
                <TextInput
                  className="border border-gray-400 rounded-lg p-3"
                  placeholder="Ex: Une aventure magique dans les montagnes où un jeune garçon découvre un monde secret..."
                  value={formik.values.prompt}
                  onChangeText={formik.handleChange('prompt')}
                  onBlur={formik.handleBlur('prompt')}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  style={{ minHeight: 120 }}
                />
                {formik.touched.prompt && formik.errors.prompt && (
                  <Text className="text-red-500 text-sm mt-1">{formik.errors.prompt}</Text>
                )}
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
                intensity={50}
                tint='light'
                style={{ padding: 16 }}
              >
                <Text className="text-lg font-baloo-semibold mb-4">Style de l'histoire</Text>

                {/* Carrousel de styles */}
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={Dimensions.get('window').width * 0.75}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingRight: 16 }}
                >
                  {STORY_STYLES.map((style) => {
                    const isSelected = formik.values.selectedStyle === style.id;
                    return (
                      <TouchableOpacity
                        key={style.id}
                        onPress={() => formik.setFieldValue('selectedStyle', style.id)}
                        style={{
                          width: Dimensions.get('window').width * 0.7,
                          marginRight: 12,
                          borderRadius: 16,
                          overflow: 'hidden',
                          borderWidth: isSelected ? 3 : 0,
                          borderColor: isSelected ? '#10B981' : 'transparent',
                        }}
                      >
                        <View
                          style={{
                            padding: 20,
                            backgroundColor: isSelected ? style.gradient[0] + '40' : '#F3F4F6',
                            borderRadius: 16,
                          }}
                        >
                          <View className="flex-row items-center justify-between mb-3">
                            <Text style={{ fontSize: 48 }}>{style.emoji}</Text>
                            {isSelected && (
                              <View className="bg-green-500 rounded-full w-8 h-8 items-center justify-center">
                                <Text className="text-white font-baloo-bold text-lg">✓</Text>
                              </View>
                            )}
                          </View>

                          <Text
                            className="font-bold text-xl mb-1"
                            style={{ color: isSelected ? style.gradient[1] : '#1F2937' }}
                          >
                            {style.name}
                          </Text>

                          <Text className="text-gray-600 text-sm">
                            {style.description}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Indicateurs de page */}
                <View className="flex-row justify-center mt-4 gap-2">
                  {STORY_STYLES.map((style) => (
                    <View
                      key={`dot-${style.id}`}
                      className="rounded-full"
                      style={{
                        width: formik.values.selectedStyle === style.id ? 24 : 8,
                        height: 8,
                        backgroundColor: formik.values.selectedStyle === style.id ? '#10B981' : '#D1D5DB',
                      }}
                    />
                  ))}
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
                intensity={50}
                tint='light'
                style={{ padding: 16 }}
              >
                <PageSelector
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
                <View className="mb-4 bg-red-50 rounded-2xl p-4">
                    <Text className="text-red-800 font-baloo-semibold text-base mb-4">Informations manquantes</Text>
                  <View className="gap-1">
                    {formik.touched.title && formik.errors.title && (
                      <Text className="text-red-700 text-sm">• {formik.errors.title}</Text>
                    )}
                    {formik.touched.prompt && formik.errors.prompt && (
                      <Text className="text-red-700 text-sm">• {formik.errors.prompt}</Text>
                    )}
                    {formik.touched.numPages && formik.errors.numPages && (
                      <Text className="text-red-700 text-sm">• {formik.errors.numPages}</Text>
                    )}
                    {formik.touched.selectedStyle && formik.errors.selectedStyle && (
                      <Text className="text-red-700 text-sm">• {formik.errors.selectedStyle}</Text>
                    )}
                  </View>
                </View>
              )}

            {/* 🖋️ Bouton */}
            <TouchableOpacity
              className="bg-[#0D1821] px-4 py-3 rounded-3xl items-center"
              onPress={handleCreateClick}
            >
              <Text className="text-white font-baloo-semibold text-lg">Créer mon histoire !</Text>
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
