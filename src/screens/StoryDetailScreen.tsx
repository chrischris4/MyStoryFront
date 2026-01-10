import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Story, RootStackParamList } from '~/types';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { useCheckFavorite } from '~/hooks/useCheckFavorite';
import { useToggleFavorite } from '~/hooks/useToggleFavorite';
import Toast from 'react-native-toast-message';
import GoBackTop, { useGoBackTop } from '~/components/GoBackTop';
import FullScreenStoryModal from '~/components/FullScreenStoryModal';




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
  const [isShared, setIsShared] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { handleScroll: handleGoBackTopScroll, isVisible: goBackTopVisible, opacity: goBackTopOpacity, scale: goBackTopScale } = useGoBackTop(200);

  // Utiliser les hooks pour les favoris
  const { data: isFavorite = false, isLoading: isFavoriteLoading } = useCheckFavorite(Number(storyId));
  const toggleFavoriteMutation = useToggleFavorite();

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate(
      { storyId: Number(storyId), isFavorite },
      {
        onSuccess: () => {
          console.log('✅ Favori mis à jour avec succès');
        },
        onError: (error) => {
          Toast.show({
            type: 'error',
            text1: 'Erreur',
            text2: 'Impossible de modifier le favori',
          });
          console.error('Erreur toggle favori:', error);
        },
      }
    );
  };

  const handleToggleShared = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Utilisateur non authentifié',
        });
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
        Toast.show({
          type: 'success',
          text1: 'Succès',
          text2: updatedStory.isShared
            ? 'Votre histoire est maintenant partagée avec la communauté!'
            : 'Votre histoire n\'est plus partagée',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Impossible de modifier le statut de partage',
        });
      }
    } catch (err) {
      console.error('Erreur lors du toggle shared:', err);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur est survenue',
      });
    }
  };

  const handleDeleteStory = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Utilisateur non authentifié',
        });
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
        Toast.show({
          type: 'success',
          text1: 'Succès',
          text2: 'Histoire supprimée avec succès',
        });
        // Naviguer après un court délai pour laisser le toast s'afficher
        setTimeout(() => {
          navigation.navigate('MainTabs');
        }, 1000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Impossible de supprimer l\'histoire',
        });
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur est survenue',
      });
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
      <View className="flex-1 items-center justify-center">
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
    <View className="flex-1 relative h-screen pt-10 pb-4" style={{ backgroundColor: skyColor }}>

      {isNight && renderStars(50)}
      <ScrollView
        ref={scrollViewRef}
        className="flex-grow px-4 z-20"
        contentContainerStyle={{ paddingBottom: 140 }}
        scrollEventThrottle={16}
        onScroll={handleGoBackTopScroll}
      >

        {/* Couverture */}
        <BlurView
          intensity={isNight ? 90 : 50}
          tint={isNight ? "dark" : "light"}
          style={{
            padding: 16, borderRadius: 12,
            overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : ''
          }}
        >
          <View className='flex flex-col p-4'>
            <Text className={`text-3xl font-baloo-bold mb-2 mt-2 text-center ${isNight ? 'text-white' : 'text-black'}`}>{story.title}</Text>
            {story.pages[0] && (
              <View
                className='w-5/6 relative aspect-square rounded-full self-center z-20 overflow-hidden'
              >
                <Image
                  source={{ uri: story.pages[0].imageUrl }}
                  resizeMode="cover"
                  className='w-full h-full'
                />
              </View>
            )}


            {/* Author date */}
            <View className='flex flex-row gap-2 items-center mt-4 justify-center'>
              {/* <Image
              source={story.user?.profil?.imageUrl ? { uri: story.user.profil.imageUrl } : require('../../assets/default-avatar.png')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
            /> */}
              <Text className={`text-base font-baloo-medium ${isNight ? 'text-white' : 'text-black'}`}>Auteur : {story.user?.profil?.name || 'Anonyme'}</Text>
              {/* <Text className="text-base font-bold text-black">{story.user?.profil?.name || 'Anonyme'}</Text> */}
            </View>
            <Text className={`text-sm font-baloo text-center px-4 pt-4 ${isNight ? 'text-white/80' : 'text-black'}`}>
              {story.createdAt ? new Date(story.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              }) : 'Date inconnue'}
            </Text>
          </View>
        </BlurView>



        {/* //Share Like */}
        <View className='flex flex-row justify-between mt-4'>
          <BlurView
            intensity={isNight ? 90 : 50}
            tint={isNight ? "dark" : "light"}
            style={{
              padding: 16, borderRadius: 100,
              height: 56,
              overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : ''
            }}
            className='flex items-center'
          >
            <TouchableOpacity
              onPress={handleToggleShared}
              className="flex-row gap-2 items-center"
            >
              <Text className={`px-4 text-lg font-baloo-semibold ${isNight ? 'text-white' : 'text-black'}`}>{isShared ? 'Histoire partagée' : 'Partager l\'histoire ?'}</Text>
              {isShared && (
                <Feather name='check' size={20} color={isNight ? '#fff' : '#000'} />
              )}
            </TouchableOpacity>
          </BlurView>

          <BlurView
            intensity={isNight ? 90 : 50}
            tint={isNight ? "dark" : "light"}
            style={{
              padding: 16, width: 56,
              height: 56,
              borderRadius: 9999,
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : ''
            }}

          >
            <TouchableOpacity
              onPress={handleToggleFavorite}
              disabled={toggleFavoriteMutation.isPending || isFavoriteLoading}
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {toggleFavoriteMutation.isPending || isFavoriteLoading ? (
                <ActivityIndicator size="small" color="red" />
              ) : (
                <MaterialIcons name={isFavorite ? 'favorite' : 'favorite-border'} size={20} color="red" />
              )}
            </TouchableOpacity>
          </BlurView>
        </View>


        {/* Button Story details  */}
        <BlurView
          intensity={isNight ? 90 : 50}
          tint={isNight ? "dark" : "light"}
          style={{
            borderRadius: 9999,
            marginTop: 16,
            marginBottom: 16,
            overflow: 'hidden',
            backgroundColor: isNight ? '#1e293b90' : ''
          }}
        >
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            className="p-4 flex-row gap-2 items-center justify-center"
          >
            <Text className={`text-lg font-baloo-semibold ${isNight ? 'text-white' : 'text-black'}`}>
              {isExpanded ? 'Masquer les pages' : 'Voir toutes les pages'}
            </Text>
            <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={isNight ? '#fff' : '#000'} />
          </TouchableOpacity>
        </BlurView>



        {/* PLEIN ECRAN */}
        <FullScreenStoryModal
          visible={isFullScreen}
          pages={story.pages}
          isNight={isNight}
          onClose={() => setIsFullScreen(false)}
        />

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

                <Text className="text-2xl font-baloo-bold text-gray-900 mb-2">
                  Supprimer l'histoire ?
                </Text>
                <Text className="text-center text-gray-600 font-baloo">
                  Cette action est irréversible. Votre histoire "{story?.title}" sera définitivement supprimée.
                </Text>
              </View>

              <View className="flex-col gap-3">
                <TouchableOpacity
                  onPress={handleDeleteStory}
                  className="bg-red-600 p-4 rounded-xl items-center"
                >
                  <Text className="text-white font-baloo-semibold text-lg">
                    Oui, supprimer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  className="bg-gray-200 p-4 rounded-xl items-center"
                >
                  <Text className="text-gray-800 font-baloo-semibold text-lg">
                    Annuler
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {isExpanded && story.pages
          .sort((a, b) => a.pageIndex - b.pageIndex)
          .map((page) => (
            <View key={page.id} className=" bg-gray-100 p-4 rounded-lg shadow mb-4">
              <Text className="mb-2 text-base font-baloo-medium">{page.text}</Text>
              <Image
                source={{ uri: page.imageUrl }}
                style={{ width: '100%', height: 200, borderRadius: 10 }}
                resizeMode="cover"
              />
            </View>
          ))}



      </ScrollView>
      {/* Navbar */}
      <View
        className='absolute bottom-0 -left-52 border-4 h-36 rounded-t-full w-[100%] z-0'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />

      <View
        className='absolute bottom-0 left-0 border-t-4 h-[75px] w-full z-30 flex flex-row items-center justify-between px-8 p-4'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className=""
        >
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsFullScreen(true)}
          className="bg-yellow-800 self-center z-30 flex flex-row h-[50px] px-6 gap-2 items-center justify-center rounded-full">
          <Text className='text-white text-lg font-baloo-medium'>Lire en plein écran </Text>
          <Feather name="play" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
        >
          <Feather name="trash-2" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bouton retour en haut */}
      <GoBackTop
        scrollViewRef={scrollViewRef}
        showAfter={200}
        onScroll={handleGoBackTopScroll}
        isVisible={goBackTopVisible}
        opacity={goBackTopOpacity}
        scale={goBackTopScale}
      />
    </View>
  );
}
