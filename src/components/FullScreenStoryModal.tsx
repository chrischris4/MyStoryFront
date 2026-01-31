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
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Brightness from 'expo-brightness';
import { useAudioPlayer } from 'expo-audio';
import type { Page } from '~/types';
import { StoryFrame, type FrameType } from './StoryFrames';
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
  const [showFrameMenu, setShowFrameMenu] = useState(false);

  // Slider de luminosité - hauteur du slider et position
  const SLIDER_HEIGHT = 150;
  const MIN_BRIGHTNESS = 0.1;
  const MAX_BRIGHTNESS = 0.7;

  const startBrightnessRef = useRef(brightness);

  const brightnessPanResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Sauvegarder la luminosité au début du geste
      startBrightnessRef.current = brightness;
    },
    onPanResponderMove: (_, gestureState) => {
      // Calculer le changement de luminosité basé sur le mouvement vertical
      // Négatif car monter = plus lumineux
      const brightnessChange = -(gestureState.dy / SLIDER_HEIGHT) * (MAX_BRIGHTNESS - MIN_BRIGHTNESS);
      const newBrightness = startBrightnessRef.current + brightnessChange;
      const clampedBrightness = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, newBrightness));

      setBrightness(clampedBrightness);
      Brightness.setBrightnessAsync(clampedBrightness);
    },
    onPanResponderRelease: () => {
      // Mettre à jour la référence pour le prochain geste
      startBrightnessRef.current = brightness;
    },
  })).current;
  const [selectedFrame, setSelectedFrame] = useState<FrameType>('none');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

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
            ref={flatListRef}
            data={allItems}
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
                  style={isRotated ? { width: '100%', height: '100%' } : undefined}
                  className={`relative ${isRotated ? '' : `aspect-square ${isPortrait ? 'w-full' : 'h-full'}`}`}
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
                      className={`absolute top-2 self-center px-4 py-2 bg-white/90 rounded-xl`}
                    >
                      <Text
                        style={{
                          color: 'black',
                          fontSize: isRotated ? 24 : (isPortrait ? 20 : 24),
                          textAlign: 'center',
                        }}
                        className='font-baloo-bold'
                      >
                        {title}
                      </Text>
                    </View>
                  )}
                  {/* Afficher la description si c'est la cover */}
                  {item.isCover && description && (
                    <View
                      className="absolute bottom-2 px-4 py-2 bg-white/90 rounded-xl self-center"
                      style={{ maxWidth: '80%', alignSelf: 'center' }}
                    >
                      <Text
                        style={{
                          color: 'black',
                          fontSize: isRotated ? 16 : (isPortrait ? 14 : 16),
                          textAlign: 'center',
                        }}
                        className='font-baloo'
                        numberOfLines={3}
                      >
                        {description}
                      </Text>
                    </View>
                  )}
                  
                  {/* Afficher le texte seulement si ce n'est pas la cover */}
                  {!item.isCover && (
                    <View
                      className={`absolute bottom-3 max-w-[80%] self-center p-2 bg-white/90 rounded-xl`}
                    >
                      <Text
                        style={{
                          color: 'black',
                          fontSize: isRotated ? 18 : (isPortrait ? 16 : 18),
                          textAlign: 'left',
                        }}
                        className='font-baloo-medium'
                      >
                        {item.text}
                      </Text>
                    </View>
                  )}
                  {/* Cadre décoratif en overlay */}
                  <StoryFrame type={selectedFrame} width={rotatedWidth} height={rotatedHeight} />
                </View>
              </View>
            )}
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
                  {showMusicMenu && (
                    <BlurView
                      intensity={isNight ? 90 : 50}
                      tint={isNight ? "dark" : "light"}
                      style={{
                        position: 'absolute',
                        top: 80,
                        left: 0,
                        borderRadius: 16,
                        overflow: 'hidden',
                        minWidth: 200,
                        maxHeight: 300,
                        zIndex: 10,
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
                  )}

                  {/* Bouton luminosité + Slider */}
                  <View style={{ position: 'relative' }}>
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

                    {/* Slider de luminosité vertical */}
                    {showBrightnessMenu && (
                      <BlurView
                        intensity={isNight ? 90 : 50}
                        tint={isNight ? "dark" : "light"}
                        style={{
                          position: 'absolute',
                          top: 75,
                          borderRadius: 9999,
                          overflow: 'hidden',
                          zIndex: 10,
                        }}
                      >
                        <View style={{ padding: 16, alignItems: 'center', width: 65, }} className='bg-white/50'>
                          {/* Slider vertical */}
                          <View
                            style={{
                              width: 40,
                              height: SLIDER_HEIGHT,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 20,
                              justifyContent: 'flex-end',
                              overflow: 'hidden',
                            }}
                            {...brightnessPanResponder.panHandlers}
                          >
                            {/* Barre de remplissage */}
                            <View
                              style={{
                                width: '100%',
                                height: `${((brightness - MIN_BRIGHTNESS) / (MAX_BRIGHTNESS - MIN_BRIGHTNESS)) * 100}%`,
                                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                borderRadius: 20,
                              }}
                            />
                            {/* Curseur */}
                            <View
                              style={{
                                position: 'absolute',
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: 'white',
                                borderWidth: 3,
                                borderColor: 'rgba(16, 185, 129, 1)',
                                left: 2,
                                bottom: `${((brightness - MIN_BRIGHTNESS) / (MAX_BRIGHTNESS - MIN_BRIGHTNESS)) * 100}%`,
                                marginBottom: -40,
                                marginTop: 40,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 4,
                                elevation: 5,
                              }}
                            />
                          </View>
                          {/* Pourcentage affiché */}
                          <Text style={{ fontSize: 14, marginTop: 8, fontWeight: '600' }}>
                            {Math.round(brightness * 100)}%
                          </Text>
                        </View>
                      </BlurView>
                    )}
                  </View>
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
                    top: 0,
                    right: 80,
                  }}
                  className='flex justify-center items-center'
                >
                  <Feather
                    name={isRotated ? "minimize" : "maximize"}
                    size={24}
                    color={isRotated ? "white" : "black"}
                  />
                </TouchableOpacity>
                {/* Bouton fermer - positionné sous le toggle button */}
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 40,
                    width: 65,
                    height: 65,
                    position: 'absolute',
                    top: 80,
                    right: 2,
                  }}
                  className='flex justify-center items-center'
                >
                  <Feather name="x" size={24} color="black" />
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

                {/* Bouton Background au milieu */}
                <View>
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
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Feather
                      name="image"
                      size={24}
                      color={showFrameMenu ? "white" : "black"}
                    />
                  </TouchableOpacity>

                  {/* Menu des cadres */}
                  {showFrameMenu && (
                    <BlurView
                      intensity={isNight ? 90 : 50}
                      tint={isNight ? "dark" : "light"}
                      style={{
                        position: 'absolute',
                        top: -180,
                        borderRadius: 16,
                        overflow: 'hidden',
                        minWidth: 280,
                        zIndex: 10,
                      }}
                      className='self-center'
                    >
                      <View style={{ padding: 12 }} className='bg-white/50'>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 12 }}>
                          {t('storyReader.frame')}
                        </Text>

                        <View className='flex flex-row flex-wrap gap-3 justify-center'>
                          <TouchableOpacity
                            onPress={() => setSelectedFrame('none')}
                            style={{
                              borderRadius: 12,
                              padding: 8,
                              backgroundColor: selectedFrame === 'none' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 36 }}>🚫</Text>
                            <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameNone')}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setSelectedFrame('stars')}
                            style={{
                              borderRadius: 12,
                              padding: 8,
                              backgroundColor: selectedFrame === 'stars' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 36 }}>⭐</Text>
                            <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameStars')}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setSelectedFrame('golden')}
                            style={{
                              borderRadius: 12,
                              padding: 8,
                              backgroundColor: selectedFrame === 'golden' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 36 }}>🖼️</Text>
                            <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameGolden')}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setSelectedFrame('fairy')}
                            style={{
                              borderRadius: 12,
                              padding: 8,
                              backgroundColor: selectedFrame === 'fairy' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 36 }}>🧚</Text>
                            <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameFairy')}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setSelectedFrame('vintage')}
                            style={{
                              borderRadius: 12,
                              padding: 8,
                              backgroundColor: selectedFrame === 'vintage' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 36 }}>📜</Text>
                            <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameVintage')}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setSelectedFrame('magic')}
                            style={{
                              borderRadius: 12,
                              padding: 8,
                              backgroundColor: selectedFrame === 'magic' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 36 }}>✨</Text>
                            <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.frameMagic')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </BlurView>
                  )}
                </View>

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
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
