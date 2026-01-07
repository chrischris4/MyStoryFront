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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Story, RootStackParamList } from '~/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '~/context/ThemeContext';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import * as ScreenOrientation from 'expo-screen-orientation';




type StoryDetailRouteProp = RouteProp<RootStackParamList, 'StoryDetail'>;
type StoryDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function StoryDetailScreen() {
  const navigation = useNavigation<StoryDetailNavigationProp>();

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(true);


  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  useEffect(() => {
    const checkIfFavorite = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/favorite-story/me`, {
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

    const url = `${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/favorite-story`;

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

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/story/${storyId}/toggle-shared`, {
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

  const handleDeleteStory = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Erreur', 'Utilisateur non authentifié');
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/story/${storyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowDeleteModal(false);
        Alert.alert('Succès', 'Histoire supprimée avec succès', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Stories'),
          },
        ]);
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer l\'histoire');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };


  const fetchStory = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Utilisateur non authentifié');

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/story/detail/${storyId}`, {
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

  // Gérer l'orientation quand la modal s'ouvre/ferme
  useEffect(() => {
    const handleOrientation = async () => {
      if (isFullScreen) {
        // Déverrouiller toutes les orientations quand la modal est ouverte
        await ScreenOrientation.unlockAsync();
      } else {
        // Verrouiller en portrait quand la modal est fermée et réinitialiser
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        setForceLandscape(false);
      }
    };

    handleOrientation();

    // Cleanup: remettre en portrait quand le composant se démonte
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, [isFullScreen]);

  // Fonction pour basculer manuellement entre portrait et paysage
  const toggleOrientation = async () => {
    try {
      if (forceLandscape || !isPortrait) {
        // Retour en portrait
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        setForceLandscape(false);
      } else {
        // Passer en paysage
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setForceLandscape(true);
      }
    } catch (error) {
      console.error('Erreur lors du changement d\'orientation:', error);
    }
  };

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

      <TouchableOpacity
          onPress={() => setIsFullScreen(true)}
          className="bg-black absolute bottom-24 self-center p-4  w-11/12 z-30 flex flex-row px-4 gap-2 items-center justify-center rounded-full">
            <Text className='text-white text-lg'>Lire en plein écran </Text>
          <Feather name="play" size={20} color="white" />
        </TouchableOpacity>

      <Text className="text-4xl font-bold mb-4 text-center px-4 pt-8">{story.title}</Text>
      <View
        className='absolute bottom-0 left-0 border-t-4 h-20 w-full z-10 flex flex-row items-center justify-between px-8 p-4'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className=""
        >
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        
        
        <TouchableOpacity
          onPress={handleToggleShared}
          className={`${isShared ? 'bg-yellow-800' : '' } h-16 w-16 rounded-full flex items-center justify-center`}
        >

          <Feather name={isShared ? 'users' : 'share-2'} size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
        >
          <Feather name="trash-2" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {isNight && renderStars(50)}
      <ScrollView
        className="flex-grow px-4"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
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
                    padding: isPortrait ? 16 : 24,
                  }}
                >
                  
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{
                      width: isPortrait ? width * 0.9 : width * 0.7,
                      height: isPortrait ? height * 0.6 : height * 0.75,
                    }}
                    resizeMode="contain"
                    className='rounded-3xl'
                  />
                  <Text
                    style={{
                      color: 'white',
                      fontSize: isPortrait ? 16 : 18,
                      marginTop: isPortrait ? 16 : 12,
                      textAlign: 'center',
                      paddingHorizontal: isPortrait ? 10 : 40,
                      maxWidth: isPortrait ? width * 0.9 : width * 0.7,
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
                {/* Boutons en haut à droite */}
                <View style={{ position: 'absolute', right: 16, top: 16, flexDirection: 'row', gap: 12 }}>
                  {/* Bouton rotation */}
                  <TouchableOpacity
                    onPress={toggleOrientation}
                    style={{
                      backgroundColor: (forceLandscape || !isPortrait) ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 40,
                      padding: 20
                    }}
                  >
                    <Feather
                      name={isPortrait ? "smartphone" : "tablet"}
                      size={24}
                      color={(forceLandscape || !isPortrait) ? "white" : "black"}
                    />
                  </TouchableOpacity>

                  {/* Bouton fermer */}
                  <TouchableOpacity
                    onPress={() => setIsFullScreen(false)}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 40, padding: 20 }}
                  >
                    <Feather name="x" size={24} color="black" />
                  </TouchableOpacity>
                </View>

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

        {/* Modal de confirmation de suppression */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 max-w-md">
              <View className="items-center mb-4">
                <Animated.View
                  style={{
                    bottom: 10,
                    alignSelf: 'center',
                  }}
                >
                  <LottieView
                    source={require('../../assets/animations/crying.json')}
                    autoPlay
                    loop={true}
                    style={{ width: 100, height: 100 }}
                  />
                </Animated.View>

                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  Supprimer l'histoire ?
                </Text>
                <Text className="text-center text-gray-600">
                  Cette action est irréversible. Votre histoire "{story?.title}" sera définitivement supprimée.
                </Text>
              </View>

              <View className="flex-col gap-3">
                <TouchableOpacity
                  onPress={handleDeleteStory}
                  className="bg-red-600 p-4 rounded-xl items-center"
                >
                  <Text className="text-white font-semibold text-lg">
                    Oui, supprimer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  className="bg-gray-200 p-4 rounded-xl items-center"
                >
                  <Text className="text-gray-800 font-semibold text-lg">
                    Annuler
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {story.pages
          .sort((a, b) => a.pageIndex - b.pageIndex)
          .map((page) => (
            <View key={page.id} className=" bg-gray-100 p-4 rounded-lg shadow mb-4">
              <Text className="mb-2 text-base">{page.text}</Text>
              <Image
                source={{ uri: page.imageUrl }}
                style={{ width: '100%', height: 200, borderRadius: 10 }}
                resizeMode="cover"
              />
            </View>
          ))}

        

      </ScrollView>
    </View>
  );
}
