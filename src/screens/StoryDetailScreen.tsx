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
  Animated,
  Easing,
  Alert,
  Dimensions,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Story, RootStackParamList } from '~/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { BlurView } from 'expo-blur';
import * as Brightness from 'expo-brightness';
import { useCheckFavorite } from '~/hooks/useCheckFavorite';
import { useToggleFavorite } from '~/hooks/useToggleFavorite';
import Toast from 'react-native-toast-message';
import GoBackTop, { useGoBackTop } from '~/components/GoBackTop';




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
  const [isShared, setIsShared] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [showBrightnessMenu, setShowBrightnessMenu] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const { handleScroll: handleGoBackTopScroll, isVisible: goBackTopVisible, opacity: goBackTopOpacity, scale: goBackTopScale } = useGoBackTop(200);

  // Utiliser les hooks pour les favoris
  const { data: isFavorite = false, isLoading: isFavoriteLoading } = useCheckFavorite(Number(storyId));
  const toggleFavoriteMutation = useToggleFavorite();

  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

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

  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, []);

  // Garder les contrôles visibles quand le menu musique ou luminosité est ouvert
  useEffect(() => {
    if (showMusicMenu || showBrightnessMenu) {
      // Annuler le timeout de masquage si un menu s'ouvre
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
      // S'assurer que les contrôles sont visibles
      if (!showControls) {
        setShowControls(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    } else if (showControls) {
      // Quand les menus se ferment, relancer le timer de masquage
      showControlsWithFade();
    }
  }, [showMusicMenu, showBrightnessMenu]);

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
      // Ne pas masquer les contrôles si un menu est ouvert
      if (!showMusicMenu && !showBrightnessMenu) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setShowControls(false);
        });
      }
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
          intensity={50}
          tint='light'
          style={{
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <View className='flex flex-col p-4'>
            <Text className="text-3xl font-baloo-bold mb-2 mt-2 text-center">{story.title}</Text>
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
              <Text className="text-base font-baloo-medium text-black">Auteur : {story.user?.profil?.name || 'Anonyme'}</Text>
              {/* <Text className="text-base font-bold text-black">{story.user?.profil?.name || 'Anonyme'}</Text> */}
            </View>
            <Text className="text-sm font-baloo text-center px-4 pt-4">
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
            intensity={50}
            tint='light'
            style={{
              borderRadius: 9999,
              overflow: 'hidden',
            }}
          >
            <TouchableOpacity
              onPress={handleToggleShared}
              className="p-4 px-6 flex-row gap-2 items-center"
            >
              <Text className='text-lg font-baloo-semibold'>{isShared ? 'Histoire partagée' : 'Partager l\'histoire ?'}</Text>
              {isShared && (
                <Feather name='check' size={20} />
              )}
            </TouchableOpacity>
          </BlurView>

          <BlurView
            intensity={50}
            tint='light'
            style={{
              width: 56,
              height: 56,
              borderRadius: 9999,
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
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
          intensity={50}
          tint='light'
          style={{
            borderRadius: 9999,
            overflow: 'hidden',
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            className="p-4 flex-row gap-2 items-center justify-center"
          >
            <Text className="text-lg font-baloo-semibold">
              {isExpanded ? 'Masquer les pages' : 'Voir toutes les pages'}
            </Text>
            <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} />
          </TouchableOpacity>
        </BlurView>



        {/* PLEIN ECRAN */}
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
                  style={{ width, height }}
                  className="justify-center items-center"
                >
                  <View className={`relative aspect-square ${isPortrait ? 'w-full' : ' h-full'}`}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      className="w-full h-full absolute top-0 left-0"
                      resizeMode="contain"
                    />
                    <View
                      className={`absolute bottom-2 left-2 right-2 p-2 bg-black/70 rounded-xl`}
                    >
                      <Text
                        style={{
                          color: 'white',
                          fontSize: isPortrait ? 16 : 18,
                          textAlign: 'left',
                        }}
                        className='font-baloo-medium'
                      >
                        {item.text}
                      </Text>
                    </View>
                  </View>
                </View>
              )} />

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
                {/* MENU FULL SCREEN */}
                <View className='absolute top-4 left-4 right-4 flex flex-row justify-between'>
                  {/* Bouton musique en haut à gauche */}
                  <View className='flex flex-row gap-4 relative'>
                      <TouchableOpacity
                        onPress={() => {
                          setShowMusicMenu(!showMusicMenu);
                          if (!showMusicMenu) setShowBrightnessMenu(false);
                        }}
                        style={{
                          backgroundColor: selectedMusic ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                          borderRadius: 40,
                          width: 65,
                          height: 65
                        }}
                        className='flex items-center justify-center'
                      >
                        <Feather
                          name="music"
                          size={24}
                          color={selectedMusic ? "white" : "black"}
                        />
                      </TouchableOpacity>

                      {/* Menu des musiques */}
                      {showMusicMenu && (
                        <BlurView
                          intensity={50}
                          tint="light"
                          style={{
                            position: 'absolute',
                            top: 80,
                            left: 0,
                            borderRadius: 16,
                            overflow: 'hidden',
                            minWidth: 200,
                            zIndex: 10,
                          }}
                        >
                          <View style={{ padding: 8 }} className='bg-white/50'>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', padding: 12, paddingBottom: 8 }}>
                              Musiques
                            </Text>

                            {/* Liste des musiques */}
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedMusic(null);
                                setShowMusicMenu(false);
                              }}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: !selectedMusic ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              }}
                            >
                              <Text style={{ fontSize: 14 }}>🔇 Aucune musique</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => {
                                setSelectedMusic('ambient');
                                setShowMusicMenu(false);
                              }}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: selectedMusic === 'ambient' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              }}
                            >
                              <Text style={{ fontSize: 14 }}>🎵 Ambiance douce</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => {
                                setSelectedMusic('adventure');
                                setShowMusicMenu(false);
                              }}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: selectedMusic === 'adventure' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              }}
                            >
                              <Text style={{ fontSize: 14 }}>⚔️ Aventure</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => {
                                setSelectedMusic('lullaby');
                                setShowMusicMenu(false);
                              }}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: selectedMusic === 'lullaby' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              }}
                            >
                              <Text style={{ fontSize: 14 }}>🌙 Berceuse</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => {
                                setSelectedMusic('magical');
                                setShowMusicMenu(false);
                              }}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: selectedMusic === 'magical' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              }}
                            >
                              <Text style={{ fontSize: 14 }}>✨ Magique</Text>
                            </TouchableOpacity>
                          </View>
                        </BlurView>
                      )}

                    {/* Bouton luminosité */}
                      <TouchableOpacity
                        onPress={() => {
                          setShowBrightnessMenu(!showBrightnessMenu);
                          if (!showBrightnessMenu) setShowMusicMenu(false);
                        }}
                        style={{
                          backgroundColor: showBrightnessMenu ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                          borderRadius: 40,
                          width: 65,
                          height: 65
                        }}
                        className='flex justify-center items-center'

                      >
                        <Feather
                          name="sun"
                          size={24}
                          color={showBrightnessMenu ? "white" : "black"}
                        />
                      </TouchableOpacity>

                      {/* Menu de luminosité */}
                      {showBrightnessMenu && (
                        <BlurView
                          intensity={50}
                          tint="light"
                          style={{
                            position: 'absolute',
                            top: 80,
                            left: 0,
                            borderRadius: 16,
                            overflow: 'hidden',
                            minWidth: 200,
                            zIndex: 10,
                          }}
                        >
                          <View style={{ padding: 16 }} className='bg-white/50'>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                              Luminosité
                            </Text>

                            {/* Presets de luminosité */}
                            <TouchableOpacity
                              onPress={async () => {
                                setBrightness(0.3);
                                await Brightness.setBrightnessAsync(0.3);
                              }}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: brightness === 0.3 ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              }}
                            >
                              <Text style={{ fontSize: 14 }}>🌑 Faible (30%)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={async () => {
                                setBrightness(0.5);
                                await Brightness.setBrightnessAsync(0.5);
                              }}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: brightness === 0.5 ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              }}
                            >
                              <Text style={{ fontSize: 14 }}>🌓 Moyenne (50%)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={async () => {
                                setBrightness(0.7);
                                await Brightness.setBrightnessAsync(0.7);
                              }}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: brightness === 0.7 ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              }}
                            >
                              <Text style={{ fontSize: 14 }}>🌕 Forte (70%)</Text>
                            </TouchableOpacity>
                          </View>
                        </BlurView>
                      )}
                  </View>
                  <View className='flex flex-row gap-4'>
                    {/* Bouton rotation */}
                    <TouchableOpacity
                      onPress={toggleOrientation}
                      style={{
                        backgroundColor: (forceLandscape || !isPortrait) ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                        borderRadius: 40,
                        width: 65,
                        height: 65
                      }}
                      className='flex justify-center items-center'
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
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 40, width: 65,
                        height: 65
                      }}
                      className='flex justify-center items-center'
                    >
                      <Feather name="x" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 40, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="chevron-left" size={24} color="black" />
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
