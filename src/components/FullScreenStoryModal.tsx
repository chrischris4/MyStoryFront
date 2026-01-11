import React, { useState, useRef, useEffect } from 'react';
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
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Brightness from 'expo-brightness';
import * as ScreenOrientation from 'expo-screen-orientation';
import type { Page } from '~/types';

interface FullScreenStoryModalProps {
  visible: boolean;
  pages: Page[];
  isNight: boolean;
  onClose: () => void;
}

export default function FullScreenStoryModal({
  visible,
  pages,
  isNight,
  onClose,
}: FullScreenStoryModalProps) {
  const [showControls, setShowControls] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(true);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [showBrightnessMenu, setShowBrightnessMenu] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<string>('black');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  const handleUserTouch = () => {
    // Si un menu est ouvert, le fermer au lieu de toggler les contrôles
    if (showMusicMenu || showBrightnessMenu || showBackgroundMenu) {
      setShowMusicMenu(false);
      setShowBrightnessMenu(false);
      setShowBackgroundMenu(false);
      return;
    }

    setShowControls(true);

    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Ne masquer les contrôles que si aucun menu n'est ouvert
    if (!showMusicMenu && !showBrightnessMenu && !showBackgroundMenu) {
      hideTimeout.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowControls(false);
        });
      }, 3000);
    }
  };

  const toggleOrientation = async () => {
    if (forceLandscape || !isPortrait) {
      await ScreenOrientation.unlockAsync();
      setForceLandscape(false);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setForceLandscape(true);
    }
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
    if (currentPageIndex < sortedPages.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentPageIndex + 1,
        animated: true,
      });
    }
  };

  const sortedPages = [...pages].sort((a, b) => a.pageIndex - b.pageIndex);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, []);

  // Garder les contrôles visibles quand un menu est ouvert
  useEffect(() => {
    if (showMusicMenu || showBrightnessMenu || showBackgroundMenu) {
      // Annuler le timeout si un menu s'ouvre
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
      // S'assurer que les contrôles sont visibles
      setShowControls(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showMusicMenu, showBrightnessMenu, showBackgroundMenu]);

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ backgroundColor: selectedBackground }}>
        <FlatList
          ref={flatListRef}
          data={sortedPages}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onTouchStart={handleUserTouch}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentPageIndex(index);
          }}
          renderItem={({ item }) => (
            <View
              style={{ width, height }}
              className="justify-center items-center"
            >
              <View className={`relative aspect-square ${isPortrait ? 'w-full' : ' h-full'}`}>
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
                        Musiques
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
                        <Text style={{ fontSize: 14 }}>🔇 Aucune musique</Text>
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
                        <Text style={{ fontSize: 14 }}>🎵 Ambiance douce</Text>
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
                        <Text style={{ fontSize: 14 }}>⚔️ Aventure</Text>
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
                        <Text style={{ fontSize: 14 }}>🌙 Berceuse</Text>
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
                        <Text style={{ fontSize: 14 }}>✨ Magique</Text>
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
                        Luminosité
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
                      top: -125,
                      borderRadius: 16,
                      overflow: 'hidden',
                      minWidth: 200,
                      zIndex: 10,
                    }}
                    className='self-center'
                  >
                    <View style={{ padding: 8 }} className='bg-white/50'>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', padding: 12, paddingBottom: 8 }}>
                        Arrière-plan
                      </Text>

                      <View className='flex flex-row gap-3 p-4 pt-0'>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedBackground('black');
                          }}
                          style={{
                            borderRadius: 8,
                            backgroundColor: selectedBackground === 'black' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 32 }}>⚫</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setSelectedBackground('#1a1a1a');
                          }}
                          style={{
                            borderRadius: 8,
                            backgroundColor: selectedBackground === '#1a1a1a' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 32 }}>⚫</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setSelectedBackground('#1e3a5f');
                          }}
                          style={{
                            borderRadius: 8,
                            backgroundColor: selectedBackground === '#1e3a5f' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 32 }}>🔵</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setSelectedBackground('#2d1b2e');
                          }}
                          style={{
                            borderRadius: 8,
                            backgroundColor: selectedBackground === '#2d1b2e' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 32 }}>🟣</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setSelectedBackground('#1a2e1a');
                          }}
                          style={{
                            borderRadius: 8,
                            backgroundColor: selectedBackground === '#1a2e1a' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 32 }}>🟢</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </BlurView>
                )}
              </View>

              <TouchableOpacity
                onPress={goToNextPage}
                disabled={currentPageIndex === sortedPages.length - 1}
                style={{
                  backgroundColor: currentPageIndex === sortedPages.length - 1 ? 'rgba(200, 200, 200, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 40,
                  padding: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Feather name="chevron-right" size={24} color={currentPageIndex === sortedPages.length - 1 ? '#999' : 'black'} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
