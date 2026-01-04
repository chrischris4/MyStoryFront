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
  Alert,
  Dimensions
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import BottomNavBar from '~/navigation/BottomNavBar';
import type { Story, RootStackParamList } from '~/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '~/context/ThemeContext';




type StoryDetailRouteProp = RouteProp<RootStackParamList, 'StoryDetail'>;

export default function StoryDetailScreen() {
  const navigation = useNavigation();

  const route = useRoute<StoryDetailRouteProp>();
  const { isNight } = useTheme();

  const { storyId } = route.params;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isFavorite, setIsFavorite] = useState(true);
  const [isShared, setIsShared] = useState(false);


  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  useEffect(() => {
    const checkIfFavorite = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch('http://192.168.1.95:3000/favorite-story/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const favorites = await response.json();
      const isFav = favorites.some((fav) => fav.story.id === Number(storyId));
      setIsFavorite(isFav);
      console.log("Favorites:", favorites.map(f => f.story.id), "Current storyId:", storyId);

    };

    checkIfFavorite();
  }, [storyId]);




  const handleToggleFavorite = async () => {
    const token = await AsyncStorage.getItem('accessToken');

    const url = isFavorite
      ? 'http://192.168.1.95:3000/favorite-story'
      : 'http://192.168.1.95:3000/favorite-story';

    const method = isFavorite ? 'DELETE' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ storyId }),
    });

    if (response.ok) {
      setIsFavorite(!isFavorite);
    } else {
      console.error('Erreur lors du changement de favori');
    }
  };

  const handleToggleShared = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Erreur', 'Utilisateur non authentifié');
        return;
      }

      const response = await fetch(`http://192.168.1.95:3000/story/${storyId}/toggle-shared`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedStory = await response.json();
        setIsShared(updatedStory.isShared);
        Alert.alert(
          'Succès',
          updatedStory.isShared
            ? 'Votre histoire est maintenant partagée avec la communauté!'
            : 'Votre histoire n\'est plus partagée'
        );
      } else {
        Alert.alert('Erreur', 'Impossible de modifier le statut de partage');
      }
    } catch (err) {
      console.error('Erreur lors du toggle shared:', err);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };


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
      setIsShared(data.isShared || false);
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

  const skyColor = isNight ? '#020205' : '#87CEEB';
  const cloudColor = isNight ? '#A0AEC0' : '#FFFFFF';
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';

  // Génère n étoiles aléatoires
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
    <View className="flex-1 relative h-screen" style={{ backgroundColor: skyColor }}>
      {/* Sol */}
      <View
        className='absolute bottom-0 -left-52 border-4 h-36 rounded-t-full w-[100%] z-0'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <View
        className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-10'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      {isNight && renderStars(50)}
      <ScrollView className="flex-grow px-4 pt-10" >

        <Text className="text-4xl font-bold mb-4 text-center">{story.title}</Text>




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
                  <TouchableOpacity
                    onPress={handleToggleFavorite}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 40,
                      padding: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <MaterialIcons name={isFavorite ? 'favorite' : 'favorite-border'} size={24} color="red" />
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
        <TouchableOpacity
          onPress={handleToggleShared}
          className="p-4 rounded-xl mb-4 flex-row w-full justify-between items-center"
          style={{ backgroundColor: isShared ? '#10B981' : '#6B7280' }}
        >
          <Text className="text-white font-medium text-xl">
            {isShared ? 'Histoire partagée' : 'Partager cette histoire'}
          </Text>
          <Feather name={isShared ? 'users' : 'share-2'} size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsFullScreen(true)}
          className="bg-black p-4 rounded-xl mb-4 flex-row w-full justify-between items-center"
        >
          <Text className="text-white font-medium text-xl">
            Lancer en plein écran
          </Text>
          <Feather name="play" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Stories')} // <- redirection ici
          className="bg-white p-4 rounded-xl mb-24 flex-row w-full justify-between items-center"
        >
          <Feather name="chevron-left" size={24} color="black" />
          <Text className="text-black font-medium text-xl">
            Retour
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavBar />
    </View>
  );
}
