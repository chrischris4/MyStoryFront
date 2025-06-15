import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Image, Dimensions } from 'react-native';
import StyledButton from '~/components/StyledButton';
import BottomNavBar from '~/navigation/BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';




type StoryPage = {
  page: number;
  text: string;
  imageUrl: string;
};

export default function CreateStoryScreen() {
  const [prompt, setPrompt] = useState('');
  const [numPages, setNumPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(true)
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [title, setTitle] = useState('');
  const cloudAnim = useRef(new Animated.Value(0)).current;

  const handleSubmit = async () => {
    setLoading(true);
    setStoryPages([]);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Utilisateur non connecté');

      const response = await fetch('http://192.168.1.95:3000/story/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          numberOfPages: numPages,
          title,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l’histoire');
      }

      const story = await response.json();
      console.log('Histoire générée:', story);
      setStoryPages(story.pages);
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

  useEffect(() => {
    setTitle('🐉 Le voyage de Pacha');
    setStoryPages([
      {
        page: 1,
        text: 'Pacha s’éveilla au cœur d’une forêt enchantée, le soleil dansant entre les feuillages.',
        imageUrl: 'https://picsum.photos/seed/foret-magique/400/200', // plus fiable
      },
    ]);
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






  return (
    <View className="flex-1 bg-[#F0F4EF] pt-4 px-4">
      <Text className="text-2xl font-bold pt-4">Quelle aventure</Text>
      <Text className="text-2xl font-bold pb-2">allez vous créer aujourd'hui ?</Text>
      <Text className="text-base font-light pb-4">Ici, toutes vos idées prennent vie !</Text>


      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="p-4 rounded-3xl bg-[#B4CDED] text-center mb-4">
          <Text className="text-lg font-semibold mb-2">Résumé de l'histoire</Text>
          <TextInput
            className="border border-gray-400 rounded-lg p-2"
            placeholder="Ex: Une aventure magique dans les montagnes"
            value={prompt}
            onChangeText={setPrompt}
          />
        </View>

        <View className="p-4 rounded-3xl bg-[#B4CDED] text-center mb-4">
          <Text className="text-lg font-semibold mb-2">Titre de l’histoire</Text>
          <TextInput
            className="border border-gray-400 rounded-lg p-2"
            placeholder="Ex: Pacha et la forêt magique"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="p-4 rounded-3xl bg-[#B4CDED] text-center mb-4">
          <Text className="text-lg font-semibold mb-2">Nombre de pages</Text>
          <View className="flex-row flex-wrap">
            {[...Array(10)].map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setNumPages(i + 1)}
                className={`px-3 py-1 m-1 rounded-lg border ${numPages === i + 1 ? 'bg-slate-700 border-slate-700' : 'border-gray-400'
                  }`}
              >
                <Text className={numPages === i + 1 ? 'text-white' : 'text-black'}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="gap-4 flex flex-row w-full">
          <StyledButton title="Pages" icon='+' />
          <StyledButton title="Animations" icon='+' />
        </View>

        <TouchableOpacity
          className="bg-[#0D1821] px-4 py-3 rounded-3xl items-center mt-4"
          onPress={handleSubmit}
        >
          <Text className="text-white font-semibold text-lg">Créer mon histoire ! </Text>
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
              // onPress={() =>
              //     navigation.navigate('StoryDetail', { storyId: item.id })
              // }
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
