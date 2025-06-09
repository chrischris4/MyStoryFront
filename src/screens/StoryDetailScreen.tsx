import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
  useWindowDimensions,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import BottomNavBar from '~/navigation/BottomNavBar';
import type { Story, RootStackParamList } from '~/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';



type StoryDetailRouteProp = RouteProp<RootStackParamList, 'StoryDetail'>;

export default function StoryDetailScreen() {
  const route = useRoute<StoryDetailRouteProp>();
  const { storyId } = route.params;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;


  const fetchStory = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Utilisateur non authentifié');

      const response = await fetch(`http://192.168.1.95:3000/story/detail/${storyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la story');
      }

      const data: Story = await response.json();
      setStory(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchStory();
  }, [storyId]);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, []);

  const showControlsWithFade = () => {
    setShowControls(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    hideTimeout.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setShowControls(false);
      });
    }, 4000);
  };

  const handleUserTouch = () => {
    if (showControls) {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setShowControls(false);
      });
    } else {
      showControlsWithFade();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6b21a8" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (error || !story) {
    return (
      <View className="flex-1 items-center justify-center pb-20">
        <Text className="text-red-500">{error ?? 'Story non trouvée'}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-white px-4 pt-10">
        <Text className="text-2xl font-bold mb-4 text-center">{story.title}</Text>

        <TouchableOpacity
          onPress={() => setIsFullScreen(true)}
          className="bg-black p-4 rounded-xl mb-4"
        >
          <Text className="text-white font-bold text-xl">Lancer en plein écran</Text>
          <Text className="text-gray-300 font-light">C'est partie pour une nouvelle histoire ! </Text>
          <Feather name="play" size={24} color="white" className='self-end mt-2' />


        </TouchableOpacity>

        <Modal visible={isFullScreen} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <FlatList
              data={story.pages.sort((a, b) => a.pageIndex - b.pageIndex)}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onTouchStart={handleUserTouch}
              renderItem={({ item }) => (
                <View
                  style={{
                    width,
                    height,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: isPortrait ? 16 : 32,
                    transform: isPortrait ? [] : [{ rotate: '90deg' }],
                  }}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{
                      width: isPortrait ? width * 0.9 : height * 0.9,
                      height: isPortrait ? height * 0.6 : width * 0.6,
                    }}
                    resizeMode="contain"
                    className='rounded-3xl'
                  />
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 16,
                      marginTop: 0,
                      textAlign: 'center',
                      paddingHorizontal: 10,
                    }}
                  >
                    {item.text}
                  </Text>
                </View>
              )}

            />

            {showControls && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                  opacity: fadeAnim,
                }}
                pointerEvents="box-none"
              >
                <TouchableOpacity
                  onPress={() => setIsFullScreen(false)}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', position: 'absolute', right: 16, top: 16, borderRadius: 40, padding: 20 }}
                >
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>

                <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 40, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="chevron-left" size={24} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 40, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="heart" size={24} color="red" />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 40, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="chevron-right" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </SafeAreaView>
        </Modal>


        {story.pages
          .sort((a, b) => a.pageIndex - b.pageIndex)
          .map((page) => (
            <View key={page.id} className="mb-6 bg-gray-100 p-4 rounded-lg shadow">
              <Text className="mb-2 text-base">{page.text}</Text>
              <Image
                source={{ uri: page.imageUrl }}
                style={{ width: '100%', height: 200, borderRadius: 10 }}
                resizeMode="cover"
              />
            </View>
          ))}
        <TouchableOpacity className="bg-red-400 p-4 rounded-xl mb-28 flex flex-row gap-4 justify-center">
          <Text className="text-white font-bold text-xl">Supprimer l'histoire</Text>
          <Feather name="trash" size={22} color="white" />
        </TouchableOpacity>
      </ScrollView>
      <BottomNavBar />
    </>
  );
}
