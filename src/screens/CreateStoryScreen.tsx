import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Image, Dimensions } from 'react-native';
import StyledButton from '~/components/StyledButton';
import BottomNavBar from '~/navigation/BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import PageSelector from '~/components/PageSelector';
import { useTheme } from '~/context/ThemeContext';
import { BlurView } from 'expo-blur';
import StoryModal from '~/components/StoryModal';





type StoryPage = {
  page: number;
  text: string;
  imageUrl: string;
};

export default function CreateStoryScreen() {
  const [prompt, setPrompt] = useState('');
  const [numPages, setNumPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false)
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const { isNight, toggleTheme } = useTheme();


  const handleSubmit = async () => {
    setLoading(true);
    setShowModal(true);
    setStoryPages([]);
    setStoryId(null);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Utilisateur non connecté');

      const body = { prompt, numberOfPages: numPages, title };

      // 🟩 AJOUT DES LOGS COMPLETS
      console.log('📤 Envoi de la requête /story/create');
      console.log('🔑 Token:', token ? token.slice(0, 15) + '...' : 'Aucun');
      console.log('📝 Corps envoyé au back:', JSON.stringify(body, null, 2));

      const response = await fetch('http://192.168.1.95:3000/story/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      // 🟡 LOGS DE LA RÉPONSE BRUTE
      const text = await response.text();
      console.log('📥 Réponse brute du back:', text);

      if (!response.ok) {
        console.error('❌ Erreur HTTP:', response.status, response.statusText);
        throw new Error('Erreur lors de la création de l’histoire');
      }

      // 🟢 Si tout va bien
      const story = JSON.parse(text);
      console.log('✅ Histoire générée (JSON parsé):', story);

      setStoryPages(story.pages);
      setStoryId(story.id);

    } catch (error) {
      console.error('💥 Erreur côté front:', error);
      alert('Erreur lors de la création de l’histoire.');
    } finally {
      setLoading(false);
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
      <Text className="text-base font-light pb-4">Ici, toutes vos idées prennent vie !</Text>
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
            tint={isNight ? 'dark' : 'light'}
            style={{ padding: 16 }}
          >
            <Text className="text-lg font-semibold mb-2">Titre de l’histoire</Text>
            <TextInput
              className="border border-gray-400 rounded-lg p-2"
              placeholder="Ex: Pacha et la forêt magique"
              value={title}
              onChangeText={setTitle}
            />
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
            tint={isNight ? 'dark' : 'light'}
            style={{ padding: 16 }}
          >
            <Text className="text-lg font-semibold mb-2">Résumé de l'histoire</Text>
            <TextInput
              className="border border-gray-400 rounded-lg p-2"
              placeholder="Ex: Une aventure magique dans les montagnes"
              value={prompt}
              onChangeText={setPrompt}
            />
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
            tint={isNight ? 'dark' : 'light'}
            style={{ padding: 16 }}
          >
            <PageSelector numPages={numPages} setNumPages={setNumPages} />
          </BlurView>
        </View>

        {/* 🖋️ Bouton */}
        <TouchableOpacity
          className="bg-[#0D1821] px-4 py-3 rounded-3xl items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white font-semibold text-lg">Créer mon histoire !</Text>
        </TouchableOpacity>

      </ScrollView>


      {/* /////////////////MODAL/////////////////////////////////////////////////// */}


      {showModal && (
        <StoryModal
          loading={loading}
          title={title}
          storyPages={storyPages}
          storyId={storyId}
          onClose={() => setShowModal(false)}
        />
      )}

      <BottomNavBar />
    </View>
  );
}
