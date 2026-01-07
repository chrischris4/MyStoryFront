import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated } from 'react-native';
import PageSelector from '~/components/PageSelector';
import { useTheme } from '~/context/ThemeContext';
import { BlurView } from 'expo-blur';
import StoryModal from '~/components/StoryModal';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useUserStore } from '~/store/useUserStore';
import { useNavigation } from '@react-navigation/native';





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

export default function CreateStoryScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [storyId, setStoryId] = useState<string | null>(null);
  const { isNight } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const storyCoin = useUserStore((state) => state.user?.storyCoin ?? 0);

  const formik = useFormik({
    initialValues: {
      title: '',
      prompt: '',
      numPages: 1,
      selectedStyle: 'classic',
    },
    validationSchema: createStorySchema,
    onSubmit: async (values) => {
      setLoading(true);
      setShowModal(true);
      setStoryPages([]);
      setStoryId(null);

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

        setStoryPages(story.pages);
        setStoryId(story.id);

      } catch (error) {
        Alert.alert('Erreur', 'Erreur lors de la création de l\'histoire.');
      } finally {
        setLoading(false);
      }
    },
  });



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
      {isNight && renderStars(50)}
      <View
        className='absolute bottom-0 -right-40 border-4 h-36 rounded-t-full w-[100%] z-0'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <View
        className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-10'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <Text className="text-4xl font-bold pb-2 pt-8">C'est partie pour une nouvelle aventure !</Text>
      <Text className="text-base font-light pb-2">Ici, toutes vos idées prennent vie !</Text>
      <View className="flex-col pb-4">
        {storyCoin > 0 ? (
          <Text className="text-lg font-semibold">Vous avez {storyCoin} Story Coins !</Text>
        ) : (
          <View className="flex-col">
            <Text className="text-lg font-semibold mb-2">
              Vous n'avez plus de Story Coins !
            </Text>
            <TouchableOpacity
              className="bg-purple-600 px-4 py-3 rounded-xl"
              onPress={() => navigation.navigate('Billing' as never)}
            >
              <Text className="text-white font-semibold text-center">
                🛒 Obtenir des Story Coins
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

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
            <Text className="text-lg font-semibold mb-2">Titre de l'histoire</Text>
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
            <Text className="text-lg font-semibold mb-2">Résumé de l'histoire</Text>
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
            <Text className="text-lg font-semibold mb-4">Style de l'histoire</Text>

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
                            <Text className="text-white font-bold text-lg">✓</Text>
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

        {/* 🖋️ Bouton */}
        <TouchableOpacity
          className="bg-[#0D1821] px-4 py-3 rounded-3xl items-center"
          onPress={() => formik.handleSubmit()}
        >
          <Text className="text-white font-semibold text-lg">Créer mon histoire !</Text>
        </TouchableOpacity>

      </ScrollView>


      {/* /////////////////MODAL/////////////////////////////////////////////////// */}


      {showModal && (
        <StoryModal
          loading={loading}
          title={formik.values.title}
          storyPages={storyPages}
          storyId={storyId}
          onClose={() => setShowModal(false)}
        />
      )}
    </View>
  );
}
