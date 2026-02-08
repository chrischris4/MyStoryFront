import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Brightness from 'expo-brightness';
import { useAudioPlayer } from 'expo-audio';
import type { Page } from '~/types';
import { StoryFrame, StoryEffect, type FrameType, type EffectType } from './StoryFrames';
import { useTranslation } from 'react-i18next';
import { STORY_MUSICS } from '../../assets/sounds/storySounds';
import type { StoryMusic } from '../../assets/sounds/storySounds';

interface FullScreenStoryModalProps {
  visible: boolean;
  pages: Page[];
  coverUrl?: string;
  title?: string;
  description?: string;
  isNight: boolean;
  onClose: () => void;
}

export default function FullScreenStoryModal({
  visible,
  pages,
  coverUrl,
  title,
  description,
  isNight,
  onClose,
}: FullScreenStoryModalProps) {
  const { t } = useTranslation();
  const [showControls, setShowControls] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<StoryMusic | null>(null);
  const [showBrightnessMenu, setShowBrightnessMenu] = useState(false);

  // Audio player pour la musique de story
  const audioPlayer = useAudioPlayer(selectedMusic?.source ?? null);

  // Gérer la lecture de la musique
  useEffect(() => {
    if (selectedMusic && audioPlayer) {
      audioPlayer.loop = true;
      audioPlayer.volume = 0.5;
      audioPlayer.play();
    }
  }, [selectedMusic, audioPlayer]);

  // Arrêter la musique quand on ferme le modal
  useEffect(() => {
    if (!visible && audioPlayer) {
      audioPlayer.pause();
    }
  }, [visible, audioPlayer]);
  const [brightness, setBrightness] = useState(0.7);
  const [isNightMode, setIsNightMode] = useState(false);
  const [showFrameMenu, setShowFrameMenu] = useState(false);

  // Options de luminosité
  const brightnessOptions = [
    { value: 0.3, label: '30%' },
    { value: 0.5, label: '50%' },
    { value: 0.7, label: '70%' },
  ];

  const handleBrightnessChange = (value: number) => {
    setIsNightMode(false);
    setBrightness(value);
    Brightness.setBrightnessAsync(value);
  };

  const handleNightMode = () => {
    setIsNightMode(!isNightMode);
    // On garde la luminosité actuelle, le filtre fait le reste
  };
  const [selectedFrame, setSelectedFrame] = useState<FrameType>('black');
  const [selectedEffect, setSelectedEffect] = useState<EffectType>('none');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // Animations pour les menus
  const brightnessMenuAnim = useRef(new Animated.Value(0)).current;
  const musicMenuAnim = useRef(new Animated.Value(0)).current;
  const frameMenuAnim = useRef(new Animated.Value(0)).current;

  // Animation d'ouverture/fermeture des menus
  useEffect(() => {
    Animated.timing(brightnessMenuAnim, {
      toValue: showBrightnessMenu ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showBrightnessMenu]);

  useEffect(() => {
    Animated.timing(musicMenuAnim, {
      toValue: showMusicMenu ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showMusicMenu]);

  useEffect(() => {
    Animated.timing(frameMenuAnim, {
      toValue: showFrameMenu ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showFrameMenu]);

  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  const sortedPages = [...pages].sort((a, b) => a.pageIndex - b.pageIndex);

  // Créer un tableau avec la cover en premier (si elle existe) puis les pages
  const allItems = coverUrl
    ? [{ id: 'cover', imageUrl: coverUrl, isCover: true }, ...sortedPages.map(p => ({ ...p, isCover: false }))]
    : sortedPages.map(p => ({ ...p, isCover: false }));

  const handleCloseMenus = () => {
    // Fermer tous les sous-menus si on touche ailleurs
    if (showMusicMenu || showBrightnessMenu || showFrameMenu) {
      setShowMusicMenu(false);
      setShowBrightnessMenu(false);
      setShowFrameMenu(false);
    }
  };

  const toggleControls = () => {
    if (showControls) {
      // Fermer les contrôles
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowControls(false);
        setShowMusicMenu(false);
        setShowBrightnessMenu(false);
        setShowFrameMenu(false);
      });
    } else {
      // Ouvrir les contrôles
      setShowControls(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleRotation = () => {
    setIsRotated(!isRotated);
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentPageIndex - 1,
        animated: true,
      });
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < allItems.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentPageIndex + 1,
        animated: true,
      });
    }
  };



  // Dimensions pour le mode rotaté
  const rotatedWidth = isRotated ? height : width;
  const rotatedHeight = isRotated ? width : height;

  return (
    <Modal visible={visible} animationType="slide">
      <StatusBar hidden={true} />
      <SafeAreaView style={{ backgroundColor: 'black' }}>
        {/* Container principal qui pivote */}
        <View
          style={isRotated ? {
            width: height,
            height: width,
            transform: [
              { rotate: '90deg' },
              { translateX: (height - width) / 2 },
              { translateY: (height - width) / 2 },
            ],
          } : {
            width,
            height,
          }}
        >
          <FlatList
            key={isRotated ? 'rotated' : 'normal'}
            ref={flatListRef}
            data={allItems}
            extraData={isRotated}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onTouchStart={handleCloseMenus}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / rotatedWidth);
              setCurrentPageIndex(index);
            }}
            renderItem={({ item }) => (
              <View
                style={{ width: rotatedWidth, height: rotatedHeight }}
                className="justify-center items-center"
              >
                <View
                  style={isRotated
                    ? { width: '100%', height: '100%' }
                    : { width: rotatedWidth, height: rotatedWidth * (9 / 16) }
                  }
                  className="relative"
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                    contentFit="contain"
                  />
                  {/* Afficher le titre si c'est la cover */}
                  {item.isCover && title && (
                    <View
                      className={` ${isRotated ? 'top-10 px-4 py-2' : 'top-4 px-2 py-1'} absolute self-center bg-white/90 rounded-xl`}
                    >
                      <Text
                        className={` ${isRotated ? 'text-3xl mt-3' : 'text-lg'} font-baloo-bold`}
                      >
                        {title}
                      </Text>
                    </View>
                  )}
                  {/* Afficher le texte seulement si ce n'est pas la cover */}
                  {!item.isCover && (
                    <View
                      className={`${isRotated ? 'px-4 pt-2 mb-2' : 'px-2 py-1 mb-1'} bottom-4 absolute flex justify-center items-center max-w-[80%] self-center bg-white/90 rounded-xl`}
                    >
                      <Text
                        className={` ${isRotated ? 'text-2xl mb-1' : 'text-base'} font-baloo-medium`}
                      >
                        {item.text}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          />

          {/* Cadre + Effet rendus une seule fois en overlay */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: isRotated ? 0 : (rotatedHeight - rotatedWidth * (9 / 16)) / 2,
              left: 0,
              width: rotatedWidth,
              height: isRotated ? rotatedHeight : rotatedWidth * (9 / 16),
            }}
          >
            <StoryFrame
              type={selectedFrame}
              width={rotatedWidth}
              height={isRotated ? rotatedHeight : rotatedWidth * (9 / 16)}
            />
            <StoryEffect
              type={selectedEffect}
              width={rotatedWidth}
              height={isRotated ? rotatedHeight : rotatedWidth * (9 / 16)}
            />
          </View>

          {/* Overlay sombre quand le menu est visible */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              opacity: fadeAnim,
              zIndex: 1,
            }}
          />

          {/* Bouton toggle menu - toujours visible */}
          <TouchableOpacity
            onPress={toggleControls}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: showControls ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.7)',
              borderRadius: 40,
              width: 65,
              height: 65,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 20,
            }}
          >
            <Feather
              name="menu"
              size={22}
              color={showControls ? "white" : "black"}
            />
          </TouchableOpacity>

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




                  {/* Bouton luminosité + Slider */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowBrightnessMenu(!showBrightnessMenu);
                      if (!showBrightnessMenu) {
                        setShowMusicMenu(false);
                        setShowFrameMenu(false);
                      }
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

                  {/* Menu de luminosité avec boutons */}
                  <Animated.View
                    pointerEvents={showBrightnessMenu ? 'auto' : 'none'}
                    style={{
                      position: 'absolute',
                      top: 80,
                      zIndex: 10,
                      opacity: brightnessMenuAnim,
                      transform: [{
                        translateY: brightnessMenuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      }],
                    }}
                  >
                    <BlurView
                      intensity={90}
                      tint={isNight ? "dark" : "light"}
                      style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                      }}
                    >
                      <View style={{ padding: 12, alignItems: 'center', gap: 8 }} className='bg-white/50'>
                        {/* Boutons de luminosité */}
                        {brightnessOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            onPress={() => handleBrightnessChange(option.value)}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 22,
                              backgroundColor: brightness === option.value && !isNightMode
                                ? 'rgba(16, 185, 129, 0.9)'
                                : 'rgba(255, 255, 255, 0.9)',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 2,
                              borderColor: brightness === option.value && !isNightMode
                                ? 'rgba(16, 185, 129, 1)'
                                : 'rgba(0, 0, 0, 0.1)',
                            }}
                          >
                            <Text style={{
                              fontSize: 12,
                              fontWeight: '600',
                              color: brightness === option.value && !isNightMode ? 'white' : 'black',
                            }}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        {/* Bouton mode nocturne */}
                        <TouchableOpacity
                          onPress={handleNightMode}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: isNightMode
                              ? 'rgba(99, 102, 241, 0.9)'
                              : 'rgba(255, 255, 255, 0.9)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: isNightMode
                              ? 'rgba(99, 102, 241, 1)'
                              : 'rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <Feather
                            name="moon"
                            size={18}
                            color={isNightMode ? 'white' : 'black'}
                          />
                        </TouchableOpacity>
                      </View>
                    </BlurView>
                  </Animated.View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowMusicMenu(!showMusicMenu);
                      if (!showMusicMenu) {
                        setShowBrightnessMenu(false);
                        setShowFrameMenu(false);
                      }
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
                  <Animated.View
                    pointerEvents={showMusicMenu ? 'auto' : 'none'}
                    style={{
                      position: 'absolute',
                      top: 80,
                      left: 0,
                      zIndex: 10,
                      opacity: musicMenuAnim,
                      transform: [{
                        translateY: musicMenuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      }],
                    }}
                  >
                    <BlurView
                      intensity={90}
                      tint={isNight ? "dark" : "light"}
                      style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                        minWidth: 200,
                        maxHeight: 300,
                      }}
                    >
                      <ScrollView style={{ padding: 8 }} className='bg-white/50'>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', padding: 12, paddingBottom: 8 }}>
                          {t('storyReader.music')}
                        </Text>

                        {/* Option: Pas de musique */}
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedMusic(null);
                            audioPlayer?.pause();
                          }}
                          style={{
                            padding: 12,
                            borderRadius: 8,
                            backgroundColor: !selectedMusic ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 14 }}>🔇 {t('storyReader.noMusic')}</Text>
                        </TouchableOpacity>

                        {/* Liste dynamique des musiques */}
                        {STORY_MUSICS.map((music) => (
                          <TouchableOpacity
                            key={music.id}
                            onPress={() => {
                              setSelectedMusic(music);
                            }}
                            style={{
                              padding: 12,
                              borderRadius: 8,
                              backgroundColor: selectedMusic?.id === music.id ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                            }}
                          >
                            <Text style={{ fontSize: 14 }}>{music.emoji} {music.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </BlurView>
                  </Animated.View>
                  {/* Bouton Background au milieu */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowFrameMenu(!showFrameMenu);
                      if (!showFrameMenu) {
                        setShowMusicMenu(false);
                        setShowBrightnessMenu(false);
                      }
                    }}
                    style={{
                      backgroundColor: showFrameMenu ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 40,
                      width: 65,
                      height: 65,
                    }}
                    className='flex justify-center items-center'
                  >
                    <Feather
                      name="image"
                      size={24}
                      color={showFrameMenu ? "white" : "black"}
                    />
                  </TouchableOpacity>

                  {/* Menu des cadres */}
                  <Animated.View
                    pointerEvents={showFrameMenu ? 'auto' : 'none'}
                    style={{
                      position: 'absolute',
                      top: 80,
                      left: 0,
                      zIndex: 10,
                      maxWidth: width - 30,
                      opacity: frameMenuAnim,
                      transform: [{
                        translateY: frameMenuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      }],
                    }}
                  >
                    <BlurView
                      intensity={90}
                      tint={isNight ? "dark" : "light"}
                      style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                      }}
                    >
                      <View style={{ padding: 12}} className='bg-white/50 '>
                        <View className='flex flex-col'>
                          <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 12 }}>
                            {t('storyReader.frame')}
                          </Text>

                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -12 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
                            <TouchableOpacity
                              onPress={() => setSelectedFrame('black')}
                              style={{
                                borderRadius: 12,
                                padding: 8,
                                backgroundColor: selectedFrame === 'black' ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: '#000000',
                                  borderWidth: 1,
                                  borderColor: '#666',
                                }}
                              />
                              <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameBlack')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setSelectedFrame('white')}
                              style={{
                                borderRadius: 12,
                                padding: 8,
                                backgroundColor: selectedFrame === 'white' ? 'rgba(200, 200, 200, 0.5)' : 'transparent',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: '#FFFFFF',
                                  borderWidth: 1,
                                  borderColor: '#DDD',
                                }}
                              />
                              <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameWhite')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setSelectedFrame('gold')}
                              style={{
                                borderRadius: 12,
                                padding: 8,
                                backgroundColor: selectedFrame === 'gold' ? 'rgba(255, 215, 0, 0.3)' : 'transparent',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: '#FFD700',
                                }}
                              />
                              <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameGold')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setSelectedFrame('blue')}
                              style={{
                                borderRadius: 12,
                                padding: 8,
                                backgroundColor: selectedFrame === 'blue' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: '#3B82F6',
                                }}
                              />
                              <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameBlue')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setSelectedFrame('pink')}
                              style={{
                                borderRadius: 12,
                                padding: 8,
                                backgroundColor: selectedFrame === 'pink' ? 'rgba(236, 72, 153, 0.3)' : 'transparent',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: '#EC4899',
                                }}
                              />
                              <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.framePink')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setSelectedFrame('red')}
                              style={{
                                borderRadius: 12,
                                padding: 8,
                                backgroundColor: selectedFrame === 'red' ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: '#EF4444',
                                }}
                              />
                              <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameRed')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setSelectedFrame('yellow')}
                              style={{
                                borderRadius: 12,
                                padding: 8,
                                backgroundColor: selectedFrame === 'yellow' ? 'rgba(245, 158, 11, 0.3)' : 'transparent',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: '#F59E0B',
                                }}
                              />
                              <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameYellow')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setSelectedFrame('green')}
                              style={{
                                borderRadius: 12,
                                padding: 8,
                                backgroundColor: selectedFrame === 'green' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: '#10B981',
                                }}
                              />
                              <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameGreen')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setSelectedFrame('purple')}
                              style={{
                                borderRadius: 12,
                                padding: 8,
                                backgroundColor: selectedFrame === 'purple' ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  backgroundColor: '#8B5CF6',
                                }}
                              />
                              <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.framePurple')}</Text>
                            </TouchableOpacity>
                          </ScrollView>
                          <View className='flex flex-col' style={{ marginTop: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 12 }}>
                              {t('storyReader.effect')}
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -12 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
                              <TouchableOpacity
                                onPress={() => setSelectedEffect('none')}
                                style={{
                                  borderRadius: 12,
                                  padding: 8,
                                  backgroundColor: selectedEffect === 'none' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                                  alignItems: 'center',
                                }}
                              >
                                <Feather name="x-circle" size={36} color="#999" />
                                <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectNone')}</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() => setSelectedEffect('stars')}
                                style={{
                                  borderRadius: 12,
                                  padding: 8,
                                  backgroundColor: selectedEffect === 'stars' ? 'rgba(255, 215, 0, 0.3)' : 'transparent',
                                  alignItems: 'center',
                                }}
                              >
                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  <View style={{ position: 'absolute', top: 6, left: 8, width: 4, height: 4, backgroundColor: '#FFD700', borderRadius: 2 }} />
                                  <View style={{ position: 'absolute', top: 14, right: 7, width: 5, height: 5, backgroundColor: '#FFD700', borderRadius: 2.5 }} />
                                  <View style={{ position: 'absolute', bottom: 6, left: 14, width: 3, height: 3, backgroundColor: '#FFD700', borderRadius: 1.5 }} />
                                </View>
                                <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectStars')}</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() => setSelectedEffect('fairy')}
                                style={{
                                  borderRadius: 12,
                                  padding: 8,
                                  backgroundColor: selectedEffect === 'fairy' ? 'rgba(255, 215, 0, 0.3)' : 'transparent',
                                  alignItems: 'center',
                                }}
                              >
                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  <View style={{ position: 'absolute', top: 5, left: 10, width: 4, height: 4, backgroundColor: '#FFD700', borderRadius: 2 }} />
                                  <View style={{ position: 'absolute', top: 12, right: 8, width: 3, height: 3, backgroundColor: '#FFD700', borderRadius: 1.5 }} />
                                  <View style={{ position: 'absolute', bottom: 8, left: 7, width: 3, height: 3, backgroundColor: '#FFC107', borderRadius: 1.5 }} />
                                  <View style={{ position: 'absolute', bottom: 5, right: 10, width: 4, height: 4, backgroundColor: '#FFD700', borderRadius: 2 }} />
                                </View>
                                <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectFairy')}</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() => setSelectedEffect('magic')}
                                style={{
                                  borderRadius: 12,
                                  padding: 8,
                                  backgroundColor: selectedEffect === 'magic' ? 'rgba(155, 89, 182, 0.3)' : 'transparent',
                                  alignItems: 'center',
                                }}
                              >
                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, backgroundColor: '#9B59B6', opacity: 0.6, borderRadius: 18 }} />
                                  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, backgroundColor: '#3498DB', opacity: 0.5, borderRadius: 18 }} />
                                </View>
                                <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectMagic')}</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() => setSelectedEffect('snow')}
                                style={{
                                  borderRadius: 12,
                                  padding: 8,
                                  backgroundColor: selectedEffect === 'snow' ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
                                  alignItems: 'center',
                                }}
                              >
                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#4A90A4', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  <View style={{ position: 'absolute', top: 4, left: 8, width: 4, height: 4, backgroundColor: '#FFF', borderRadius: 2 }} />
                                  <View style={{ position: 'absolute', top: 12, right: 6, width: 3, height: 3, backgroundColor: '#FFF', borderRadius: 1.5 }} />
                                  <View style={{ position: 'absolute', bottom: 8, left: 14, width: 5, height: 5, backgroundColor: '#FFF', borderRadius: 2.5 }} />
                                  <View style={{ position: 'absolute', bottom: 4, right: 12, width: 3, height: 3, backgroundColor: '#FFF', borderRadius: 1.5 }} />
                                </View>
                                <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectSnow')}</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() => setSelectedEffect('hearts')}
                                style={{
                                  borderRadius: 12,
                                  padding: 8,
                                  backgroundColor: selectedEffect === 'hearts' ? 'rgba(255, 107, 138, 0.3)' : 'transparent',
                                  alignItems: 'center',
                                }}
                              >
                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  <Text style={{ fontSize: 18 }}>💕</Text>
                                </View>
                                <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectHearts')}</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() => setSelectedEffect('bubbles')}
                                style={{
                                  borderRadius: 12,
                                  padding: 8,
                                  backgroundColor: selectedEffect === 'bubbles' ? 'rgba(135, 206, 250, 0.3)' : 'transparent',
                                  alignItems: 'center',
                                }}
                              >
                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  <View style={{ position: 'absolute', top: 5, left: 8, width: 8, height: 8, borderWidth: 1.5, borderColor: '#87CEEB', borderRadius: 4, backgroundColor: 'rgba(135, 206, 250, 0.2)' }} />
                                  <View style={{ position: 'absolute', bottom: 6, right: 6, width: 10, height: 10, borderWidth: 1.5, borderColor: '#87CEEB', borderRadius: 5, backgroundColor: 'rgba(135, 206, 250, 0.2)' }} />
                                  <View style={{ position: 'absolute', top: 14, right: 10, width: 6, height: 6, borderWidth: 1, borderColor: '#87CEEB', borderRadius: 3, backgroundColor: 'rgba(135, 206, 250, 0.2)' }} />
                                </View>
                                <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectBubbles')}</Text>
                              </TouchableOpacity>

                              {/* <TouchableOpacity
                                onPress={() => setSelectedEffect('fireflies')}
                                style={{
                                  borderRadius: 12,
                                  padding: 8,
                                  backgroundColor: selectedEffect === 'fireflies' ? 'rgba(255, 235, 59, 0.3)' : 'transparent',
                                  alignItems: 'center',
                                }}
                              >
                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a3a1a', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  <View style={{ position: 'absolute', top: 6, left: 8, width: 5, height: 5, backgroundColor: '#FFEB3B', borderRadius: 2.5 }} />
                                  <View style={{ position: 'absolute', top: 16, right: 8, width: 4, height: 4, backgroundColor: '#FFEB3B', borderRadius: 2, opacity: 0.7 }} />
                                  <View style={{ position: 'absolute', bottom: 6, left: 14, width: 4, height: 4, backgroundColor: '#FFEB3B', borderRadius: 2, opacity: 0.8 }} />
                                </View>
                                <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectFireflies')}</Text>
                              </TouchableOpacity> */}

                              <TouchableOpacity
                                onPress={() => setSelectedEffect('confetti')}
                                style={{
                                  borderRadius: 12,
                                  padding: 8,
                                  backgroundColor: selectedEffect === 'confetti' ? 'rgba(255, 107, 107, 0.3)' : 'transparent',
                                  alignItems: 'center',
                                }}
                              >
                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  <View style={{ position: 'absolute', top: 4, left: 8, width: 4, height: 6, backgroundColor: '#FF6B6B', borderRadius: 1, transform: [{ rotate: '15deg' }] }} />
                                  <View style={{ position: 'absolute', top: 8, right: 8, width: 4, height: 6, backgroundColor: '#4ECDC4', borderRadius: 1, transform: [{ rotate: '-20deg' }] }} />
                                  <View style={{ position: 'absolute', bottom: 6, left: 12, width: 4, height: 6, backgroundColor: '#FFE66D', borderRadius: 1, transform: [{ rotate: '30deg' }] }} />
                                  <View style={{ position: 'absolute', bottom: 10, right: 10, width: 4, height: 6, backgroundColor: '#AA96DA', borderRadius: 1, transform: [{ rotate: '-10deg' }] }} />
                                </View>
                                <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectConfetti')}</Text>
                              </TouchableOpacity>
                            </ScrollView>
                          </View>
                        </View>
                      </View>
                    </BlurView>
                  </Animated.View>
                </View>

                {/* Bouton plein écran (rotation) */}
                <TouchableOpacity
                  onPress={toggleRotation}
                  style={{
                    backgroundColor: isRotated ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 40,
                    width: 65,
                    height: 65,
                    position: 'absolute',
                    top: 80,
                    right: 2,
                  }}
                  className='flex justify-center items-center'
                >
                  <Feather
                    name={isRotated ? "minimize" : "maximize"}
                    size={24}
                    color={isRotated ? "white" : "black"}
                  />
                </TouchableOpacity>


              </View>

              <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <TouchableOpacity
                  onPress={goToPreviousPage}
                  disabled={currentPageIndex === 0}
                  style={{
                    backgroundColor: currentPageIndex === 0 ? 'rgba(200, 200, 200, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 40,
                    padding: 20,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Feather name="chevron-left" size={24} color={currentPageIndex === 0 ? '#999' : 'black'} />
                </TouchableOpacity>



                <TouchableOpacity
                  onPress={goToNextPage}
                  disabled={currentPageIndex === allItems.length - 1}
                  style={{
                    backgroundColor: currentPageIndex === allItems.length - 1 ? 'rgba(200, 200, 200, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 40,
                    padding: 20,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Feather name="chevron-right" size={24} color={currentPageIndex === allItems.length - 1 ? '#999' : 'black'} />
                </TouchableOpacity>
              </View>
              {/* Bouton fermer - positionné sous le toggle button */}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.7)',
                  borderRadius: 40,
                  width: 65,
                  height: 65,
                  position: 'absolute',
                  bottom: 95,
                  right: 16,
                }}
                className='flex justify-center items-center'
              >
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Filtre lumière bleue (overlay jaune/ambre) */}
          {isNightMode && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 180, 50, 0.15)',
                zIndex: 100,
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
