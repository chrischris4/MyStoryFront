import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Brightness from 'expo-brightness';
import type { Page } from '~/types';
import { StoryBackground, type BackgroundType } from './StoryBackgrounds';
import { useTranslation } from 'react-i18next';

interface FullScreenStoryModalProps {
  visible: boolean;
  pages: Page[];
  coverUrl?: string;
  title?: string;
  isNight: boolean;
  onClose: () => void;
}

export default function FullScreenStoryModal({
  visible,
  pages,
  coverUrl,
  title,
  isNight,
  onClose,
}: FullScreenStoryModalProps) {
  const { t } = useTranslation();
  const [showControls, setShowControls] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [showBrightnessMenu, setShowBrightnessMenu] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundType>('black');
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
    if (showMusicMenu || showBrightnessMenu || showBackgroundMenu) {
      setShowMusicMenu(false);
      setShowBrightnessMenu(false);
      setShowBackgroundMenu(false);
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
        setShowBackgroundMenu(false);
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
        {/* Background animé */}
        <StoryBackground type={selectedBackground} width={width} height={height} />

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
                      className={`absolute top-2 left-2 right-2 p-2 bg-black/70 rounded-xl`}
                    >
                      <Text
                        style={{
                          color: 'white',
                          fontSize: isRotated ? 24 : (isPortrait ? 20 : 24),
                          textAlign: 'center',
                        }}
                        className='font-baloo-bold'
                      >
                        {title}
                      </Text>
                    </View>
                  )}
                  {/* Afficher le texte seulement si ce n'est pas la cover */}
                  {!item.isCover && (
                    <View
                      className={`absolute bottom-2 left-2 right-2 p-2 bg-black/70 rounded-xl`}
                    >
                      <Text
                        style={{
                          color: 'white',
                          fontSize: isRotated ? 18 : (isPortrait ? 16 : 18),
                          textAlign: 'left',
                        }}
                        className='font-baloo-medium'
                      >
                        {item.text}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          />

          {/* Bouton toggle menu - toujours visible */}
          <TouchableOpacity
            onPress={toggleControls}
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              backgroundColor: showControls ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.7)',
              borderRadius: 40,
              width: 55,
              height: 55,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <Feather
              name={showControls ? "eye-off" : "eye"}
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
                      setShowBackgroundMenu(false);
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
                      zIndex: 10,
                    }}
                  >
                    <View style={{ padding: 8 }} className='bg-white/50'>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', padding: 12, paddingBottom: 8 }}>
                        {t('storyReader.music')}
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedMusic(null);
                        }}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: !selectedMusic ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>🔇 {t('storyReader.noMusic')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedMusic('ambient');
                        }}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: selectedMusic === 'ambient' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>🎵 {t('storyReader.softAmbience')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedMusic('adventure');
                        }}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: selectedMusic === 'adventure' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>⚔️ {t('storyReader.adventure')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedMusic('lullaby');
                        }}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: selectedMusic === 'lullaby' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>🌙 {t('storyReader.lullaby')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedMusic('magical');
                        }}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: selectedMusic === 'magical' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>✨ {t('storyReader.magical')}</Text>
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                )}

                {/* Bouton luminosité */}
                <TouchableOpacity
                  onPress={() => {
                    setShowBrightnessMenu(!showBrightnessMenu);
                    if (!showBrightnessMenu) {
                      setShowMusicMenu(false);
                      setShowBackgroundMenu(false);
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

                {/* Menu de luminosité */}
                {showBrightnessMenu && (
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
                      zIndex: 10,
                    }}
                  >
                    <View style={{ padding: 16 }} className='bg-white/50'>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                        {t('storyReader.brightness')}
                      </Text>

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
                        <Text style={{ fontSize: 14 }}>🌑 {t('storyReader.low')}</Text>
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
                        <Text style={{ fontSize: 14 }}>🌓 {t('storyReader.medium')}</Text>
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
                        <Text style={{ fontSize: 14 }}>🌕 {t('storyReader.high')}</Text>
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                )}
              </View>

              <View className='flex flex-row gap-4'>
                {/* Bouton plein écran (rotation) */}
                <TouchableOpacity
                  onPress={toggleRotation}
                  style={{
                    backgroundColor: isRotated ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 40,
                    width: 65,
                    height: 65
                  }}
                  className='flex justify-center items-center'
                >
                  <Feather
                    name={isRotated ? "minimize" : "maximize"}
                    size={24}
                    color={isRotated ? "white" : "black"}
                  />
                </TouchableOpacity>

                {/* Bouton fermer */}
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 40,
                    width: 65,
                    height: 65
                  }}
                  className='flex justify-center items-center'
                >
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>
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
                    setShowBackgroundMenu(!showBackgroundMenu);
                    if (!showBackgroundMenu) {
                      setShowMusicMenu(false);
                      setShowBrightnessMenu(false);
                    }
                  }}
                  style={{
                    backgroundColor: showBackgroundMenu ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.7)',
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
                    color={showBackgroundMenu ? "white" : "black"}
                  />
                </TouchableOpacity>

                {/* Menu des backgrounds */}
                {showBackgroundMenu && (
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
                        {t('storyReader.background')}
                      </Text>

                      <View className='flex flex-row flex-wrap gap-3 justify-center'>
                        <TouchableOpacity
                          onPress={() => setSelectedBackground('black')}
                          style={{
                            borderRadius: 12,
                            padding: 8,
                            backgroundColor: selectedBackground === 'black' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                            alignItems: 'center',
                          }}
                        >
                          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#000', borderWidth: 2, borderColor: '#333' }} />
                          <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.black')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setSelectedBackground('starry-night')}
                          style={{
                            borderRadius: 12,
                            padding: 8,
                            backgroundColor: selectedBackground === 'starry-night' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 36 }}>🌙</Text>
                          <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.starry')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setSelectedBackground('ocean-waves')}
                          style={{
                            borderRadius: 12,
                            padding: 8,
                            backgroundColor: selectedBackground === 'ocean-waves' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 36 }}>🌊</Text>
                          <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.ocean')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setSelectedBackground('forest-magic')}
                          style={{
                            borderRadius: 12,
                            padding: 8,
                            backgroundColor: selectedBackground === 'forest-magic' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 36 }}>🌲</Text>
                          <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.forest')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setSelectedBackground('sunset-dream')}
                          style={{
                            borderRadius: 12,
                            padding: 8,
                            backgroundColor: selectedBackground === 'sunset-dream' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 36 }}>🌅</Text>
                          <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.sunset')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setSelectedBackground('aurora')}
                          style={{
                            borderRadius: 12,
                            padding: 8,
                            backgroundColor: selectedBackground === 'aurora' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 36 }}>✨</Text>
                          <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.aurora')}</Text>
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
