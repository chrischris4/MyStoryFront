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
  const cloudAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const { isNight, toggleTheme } = useTheme();


  // const handleSubmit = async () => {
  //   setLoading(true);
  //   setShowModal(true)
  //   setStoryPages([]);
  //   setStoryId(null);

  // try {
  //   const token = await AsyncStorage.getItem('accessToken');
  //   if (!token) throw new Error('Utilisateur non connecté');

  //   const response = await fetch('http://192.168.1.95:3000/story/create', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({
  //       prompt,
  //       numberOfPages: numPages,
  //       title,
  //     }),
  //   });

  //   if (!response.ok) {
  //     throw new Error('Erreur lors de la création de l’histoire');
  //   }

  //   const story = await response.json();
  //   console.log('Histoire générée:', story);
  //   setStoryPages(story.pages);
  //   setStoryId(story.id);
  // } catch (error) {
  //   console.error('Erreur côté front:', error);
  //   alert('Erreur lors de la création de l’histoire.');
  // } finally {
  //   setLoading(false);
  // }
  // };

  const handleSubmit = async () => {
    setLoading(true);
    setShowModal(true);
    setStoryPages([]);
    setStoryId(null); // N'oublie pas ce state

    try {
      // Simule un délai
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 👇 Données factices
      const fakeStory = {
        id: 'fake-story-123',
        title: title || 'Mon histoire test',
        pages: [
          {
            page: 1,
            text: 'Ceci est la première page de votre histoire magique ✨',
            imageUrl: 'https://picsum.photos/seed/test-story/400/200',
          },
          {
            page: 2,
            text: 'Et voici la suite de l’aventure...',
            imageUrl: 'https://picsum.photos/seed/test-story2/400/200',
          },
        ],
      };

      console.log('Fake story générée:', fakeStory);
      setStoryPages(fakeStory.pages);
      setStoryId(fakeStory.id);
    } catch (error) {
      console.error('Erreur côté front:', error);
      alert('Erreur lors de la création de l’histoire.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    Animated.loop(
      Animated.timing(cloudAnim, {
        toValue: 1000,
        duration: 100000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

  }, []);


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

      <Modal visible={showModal} animationType="slide" className=''>
        <View className="flex-1 p-4 bg-sky-300 relative">
          <View className='bg-green-500 absolute bottom-0 -left-40 border-4 border-green-600 h-52  rounded-t-full w-[100%] z-0'>
          </View>
          <View className='bg-green-500 absolute bottom-0 -left-10 border-4 border-green-600 h-40 w-[200%] z-10'>
          </View>
          <Animated.View
            style={{
              transform: [{ translateX }],
              position: 'absolute',
              bottom: 72,
              alignSelf: 'center',
            }}
          >
            <LottieView
              ref={animationRef}
              source={require('../../assets/animations/dog.json')}
              autoPlay
              loop={true}
              style={{ width: 200, height: 200 }}
            />
          </Animated.View>
          <View className='bg-yellow-300 h-80 w-80 border-4 border-yellow-500 rounded-full absolute -top-20 -right-20'>
          </View>
          <Animated.View
            style={{
              transform: [{ translateX: cloudAnim }],
            }} className='absolute top-40 -left-4'>
            <View className='w-60 h-44 relative'>
              <View className='bg-white h-20 rounded-full absolute top-10 left-0 w-full'>
              </View>
              <View className='bg-white h-24 w-24 rounded-full absolute top-0 left-10'>
              </View>
              <View className='bg-white h-20 w-20 rounded-full absolute top-4 left-28'>
              </View>
            </View>
          </Animated.View>
          <Animated.View
            style={{
              transform: [{ translateX: cloudAnim }],
            }} className='absolute top-96 -left-96'>
            <View className='w-52 h-44 relative'>
              <View className='bg-white h-14 rounded-full absolute top-10 left-0 w-full'>
              </View>
              <View className='bg-white h-20 w-20 rounded-full absolute top-0 right-12'>
              </View>
              <View className='bg-white h-16 w-16 rounded-full absolute top-4 right-28'>
              </View>
            </View>
          </Animated.View>
          <Animated.View
            style={{
              transform: [{ translateX: cloudAnim }],
            }} className='absolute top-72 right-10'>
            <View className='w-52 h-44 relative'>
              <View className='bg-white h-14 rounded-full absolute top-10 left-0 w-full'>
              </View>
              <View className='bg-white h-20 w-20 rounded-full absolute top-0 right-12'>
              </View>
              <View className='bg-white h-16 w-16 rounded-full absolute top-4 right-28'>
              </View>
            </View>
          </Animated.View>
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#0D1821" />
              <Text className="mt-4 text-lg font-semibold">Nous préparons votre histoire</Text>
            </View>
          ) : (
            <View className='flex-1 justify-center relative'>
              <Text className="text-xl font-bold mb-4 text-center">Votre histoire est prête !</Text>
              {storyPages.length > 0 && (
                <View className="mb-4 bg-white p-4 rounded-3xl">
                  <Text className="text-2xl font-bold mb-2 text-center">{title}</Text>
                  <Image
                    source={{ uri: storyPages[0].imageUrl }}
                    style={{ width: '100%', height: 200, borderRadius: 16 }}
                    resizeMode="cover"
                  />
                </View>
              )}
              <TouchableOpacity
                className="bg-white px-4 py-3 rounded-3xl items-center"
                onPress={() => {
                  if (storyId) {
                    navigation.navigate('StoryDetail', { storyId });
                  }
                }}
              >
                <Text className="text-black font-semibold text-lg">Découvrir votre histoire</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-black px-4 py-3 rounded-3xl items-center absolute bottom-0 left-0 w-full"
                onPress={() => setStoryPages([])}
              >
                <Text className="text-white font-semibold text-lg">Revenir à la création</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
      <BottomNavBar />
    </View>
  );
}
