import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  useWindowDimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import PlatformBlur from '~/components/PlatformBlur';
import * as Brightness from 'expo-brightness';
import { useAudioPlayer } from 'expo-audio';
import type { Page } from '~/types';
import { StoryFrame, StoryEffect, type FrameType, type EffectType, type TextStylePreset, TEXT_STYLE_PRESETS } from './StoryFrames';
import FrameMenu from './FrameMenu';
import { useTranslation } from 'react-i18next';
import { STORY_MUSICS, MUSIC_CATEGORIES } from '../../assets/sounds/storySounds';
import type { StoryMusic } from '../../assets/sounds/storySounds';

interface FullScreenStoryModalProps {
  visible: boolean;
  pages: Page[];
  coverUrl?: string | number;
  title?: string;
  description?: string;
  author?: string;
  isNight: boolean;
  onClose: () => void;
}

export default function FullScreenStoryModal({
  visible,
  pages,
  coverUrl,
  title,
  description,
  author,
  isNight,
  onClose,
}: FullScreenStoryModalProps) {
  const { t } = useTranslation();
  const { bottom: bottomInset, top: topInset } = useSafeAreaInsets();
  const safeTop = Platform.OS === 'android' ? topInset : 0;
  const safeBottom = Platform.OS === 'android' ? bottomInset : 0;
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
  const [selectedTextStyle, setSelectedTextStyle] = useState<TextStylePreset>(TEXT_STYLE_PRESETS[0]);

  // Charger les préférences sauvegardées au montage
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const [frame, effect, textStyleId] = await Promise.all([
          AsyncStorage.getItem('@story_reader_frame'),
          AsyncStorage.getItem('@story_reader_effect'),
          AsyncStorage.getItem('@story_reader_text_style'),
        ]);
        if (frame) setSelectedFrame(frame as FrameType);
        if (effect) setSelectedEffect(effect as EffectType);
        if (textStyleId) {
          const preset = TEXT_STYLE_PRESETS.find(p => p.id === textStyleId);
          if (preset) setSelectedTextStyle(preset);
        }
      } catch {}
    };
    loadPrefs();
  }, []);

  const handleSelectFrame = (frame: FrameType) => {
    setSelectedFrame(frame);
    AsyncStorage.setItem('@story_reader_frame', frame).catch(() => {});
  };

  const handleSelectEffect = (effect: EffectType) => {
    setSelectedEffect(effect);
    AsyncStorage.setItem('@story_reader_effect', effect).catch(() => {});
  };

  const handleSelectTextStyle = (style: TextStylePreset) => {
    setSelectedTextStyle(style);
    AsyncStorage.setItem('@story_reader_text_style', style.id).catch(() => {});
  };
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
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
  const isMd = width >= 768;
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

  // Dimensions réelles de l'image affichée (contentFit="contain" avec ratio 16:9)
  // Arrondi pour éviter les gaps sub-pixel entre le cadre et l'image
  const imageAspect = 16 / 9;
  let frameW: number, frameH: number, frameTop: number, frameLeft: number;
  if (isRotated) {
    const containerAspect = rotatedWidth / rotatedHeight;
    if (containerAspect > imageAspect) {
      frameH = rotatedHeight;
      frameW = Math.ceil(rotatedHeight * imageAspect);
      frameTop = 0;
      frameLeft = Math.floor((rotatedWidth - frameW) / 2);
    } else {
      frameW = rotatedWidth;
      frameH = Math.ceil(rotatedWidth / imageAspect);
      frameTop = Math.floor((rotatedHeight - frameH) / 2);
      frameLeft = 0;
    }
  } else {
    frameW = rotatedWidth;
    frameH = Math.ceil(rotatedWidth * (9 / 16));
    frameTop = Math.floor((rotatedHeight - frameH) / 2);
    frameLeft = 0;
  }

  // Opacité et slide du texte liés à la position du scroll
  const textOpacity = useMemo(() => {
    const n = allItems.length;
    if (n <= 1) return scrollX.interpolate({ inputRange: [0, 1], outputRange: [1, 1], extrapolate: 'clamp' });
    const inputRange: number[] = [];
    const outputRange: number[] = [];
    for (let i = 0; i < n; i++) {
      const center = i * frameW;
      if (i > 0) { inputRange.push(center - frameW * 0.15); outputRange.push(0); }
      inputRange.push(center);
      outputRange.push(1);
      if (i < n - 1) { inputRange.push(center + frameW * 0.15); outputRange.push(0); }
    }
    return scrollX.interpolate({ inputRange, outputRange, extrapolate: 'clamp' });
  }, [allItems.length, frameW]);

  const textSlide = useMemo(() => {
    const n = allItems.length;
    if (n <= 1) return scrollX.interpolate({ inputRange: [0, 1], outputRange: [0, 0], extrapolate: 'clamp' });
    const inputRange: number[] = [];
    const outputRange: number[] = [];
    for (let i = 0; i < n; i++) {
      const center = i * frameW;
      if (i > 0) { inputRange.push(center - frameW * 0.15); outputRange.push(8); }
      inputRange.push(center);
      outputRange.push(0);
      if (i < n - 1) { inputRange.push(center + frameW * 0.15); outputRange.push(8); }
    }
    return scrollX.interpolate({ inputRange, outputRange, extrapolate: 'clamp' });
  }, [allItems.length, frameW]);

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <StatusBar hidden={true} />
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {/* Container principal qui pivote */}
        <View
          style={isRotated ? {
            width: height,
            height: width,
            backgroundColor: 'black',
            transform: [
              { rotate: '90deg' },
              { translateX: (height - width) / 2 },
              { translateY: (height - width) / 2 },
            ],
          } : {
            width,
            height,
            backgroundColor: 'black',
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
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            style={{
              position: 'absolute',
              left: frameLeft,
              top: frameTop,
              width: frameW,
              height: frameH,
              overflow: 'hidden',
            }}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / frameW);
              setCurrentPageIndex(index);
            }}
            renderItem={({ item }) => (
              <View
                style={{ width: frameW, height: frameH }}
              >
                  <Image
                    source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                    contentFit="cover"
                  />
                  {/* Titre en haut de la cover */}
                  {item.isCover && title && (
                    <Animated.View
                      className="absolute self-center z-20 rounded-xl"
                      style={{
                        top: isRotated ? (isMd ? 30 : 20) : (isMd ? 30 : 18),
                        maxWidth: '85%',
                        paddingHorizontal: isRotated ? (isMd ? 24 : 16) : (isMd ? 12 : 8),
                        paddingVertical: isRotated ? (isMd ? 12 : 4) : (isMd ? 6 : 2),
                        backgroundColor: selectedTextStyle.bgColor,
                      }}
                    >
                      <Text
                        className="font-baloo-bold text-center"
                        style={{
                          fontSize: isRotated ? (isMd ? 30 : 24) : (isMd ? 24 : 12),
                          color: selectedTextStyle.textColor,
                        }}
                      >
                        {title}
                      </Text>
                    </Animated.View>
                  )}
                  {/* Description et auteur en bas de la cover */}
                  {item.isCover && (description || author) && (
                    <Animated.View
                      className="absolute self-center z-20"
                      style={{
                        bottom: isRotated ? (isMd ? 30 : 20) : (isMd ? 30 : 18),
                        maxWidth: '65%',
                        alignItems: 'center',
                        gap: isRotated ? 8 : 4,
                      }}
                    >
                      {description && (
                        <View
                          className="rounded-xl"
                          style={{
                            paddingHorizontal: isRotated ? (isMd ? 24 : 16) : (isMd ? 12 : 8),
                            paddingVertical: isRotated ? (isMd ? 10 : 6) : (isMd ? 4 : 3),
                            backgroundColor: selectedTextStyle.bgColor,
                          }}
                        >
                          <Text
                            className="font-baloo text-center"
                            style={{
                              fontSize: isRotated ? (isMd ? 18 : 14) : (isMd ? 14 : 9),
                              color: selectedTextStyle.textColor,
                            }}
                            numberOfLines={3}
                          >
                            {description}
                          </Text>
                        </View>
                      )}
                      {author && (
                        <View
                          className="rounded-xl"
                          style={{
                            paddingHorizontal: isRotated ? (isMd ? 20 : 12) : (isMd ? 10 : 6),
                            paddingVertical: isRotated ? (isMd ? 8 : 4) : (isMd ? 3 : 2),
                            backgroundColor: selectedTextStyle.bgColor,
                          }}
                        >
                          <Text
                            className="font-baloo-medium text-center"
                            style={{
                              fontSize: isRotated ? (isMd ? 16 : 12) : (isMd ? 12 : 9),
                              color: selectedTextStyle.textColor,
                            }}
                          >
                            {t('storyDetail.author', { name: author })}
                          </Text>
                        </View>
                      )}
                    </Animated.View>
                  )}
                  {/* Afficher le texte seulement si ce n'est pas la cover */}
                  {!item.isCover && (
                    <Animated.View
                      className="absolute flex justify-center items-center self-center rounded-xl z-20"
                      style={{
                        bottom: isRotated ? (isMd ? 30 : 20) : (isMd ? 30 : 18),
                        maxWidth: '80%',
                        paddingHorizontal: isRotated ? (isMd ? 24 : 16) : (isMd ? 12 : 8),
                        paddingVertical: isRotated ? (isMd ? 12 : 8) : (isMd ? 6 : 4),
                        opacity: textOpacity,
                        transform: [{ translateY: textSlide }],
                        backgroundColor: selectedTextStyle.bgColor,
                      }}
                    >
                      <Text
                        className="font-baloo-medium"
                        style={{
                          fontSize: isRotated ? (isMd ? 24 : 16) : (isMd ? 18 : 10),
                          color: selectedTextStyle.textColor,
                        }}
                      >
                        {item.text}
                      </Text>
                    </Animated.View>
                  )}
              </View>
            )}
          />

          {/* Cadre + Effet rendus une seule fois en overlay */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: frameTop,
              left: frameLeft,
              width: frameW,
              height: frameH,
            }}
          >
            <StoryFrame
              type={selectedFrame}
              width={frameW}
              height={frameH}
              borderSize={isMd ? 18 : 12}
            />
            <StoryEffect
              type={selectedEffect}
              width={frameW}
              height={frameH}
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
              top: 16 + (isRotated ? 0 : safeTop),
              right: 16 + (isRotated ? safeBottom : 0),
              backgroundColor: showControls ? '#5FD5FF' : 'rgba(255, 255, 255, 0.7)',
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
              color="black"
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
              <View style={{ position: 'absolute', top: 16 + (isRotated ? 0 : safeTop), left: 16 + (isRotated ? safeBottom : 0), right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
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
                      backgroundColor: showBrightnessMenu ? '#5FD5FF' : 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 40,
                      width: 65,
                      height: 65
                    }}
                    className='flex justify-center items-center'
                  >
                    <Feather
                      name="sun"
                      size={24}
                      color="black"
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
                    <PlatformBlur
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
                                ? '#5FD5FF'
                                : 'rgba(255, 255, 255, 0.9)',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 2,
                              borderColor: brightness === option.value && !isNightMode
                                ? '#5FD5FF50'
                                : 'rgba(0, 0, 0, 0.1)',
                            }}
                          >
                            <Text style={{
                              fontSize: 12,
                              fontWeight: '600',
                              color: 'black',
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
                              ? '#5FD5FF'
                              : 'rgba(255, 255, 255, 0.9)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: isNightMode
                              ? '#5FD5FF'
                              : 'rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <Feather
                            name="moon"
                            size={18}
                            color='black'
                          />
                        </TouchableOpacity>
                      </View>
                    </PlatformBlur>
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
                      backgroundColor: showMusicMenu ? '#5FD5FF' : 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 40,
                      width: 65,
                      height: 65
                    }}
                    className='flex items-center justify-center'
                  >
                    <Feather
                      name="music"
                      size={24}
                      color="black"
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
                    <PlatformBlur
                      intensity={90}
                      tint={isNight ? "dark" : "light"}
                      style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                        minWidth: 200,
                        maxHeight: isRotated ? 200 : 300,
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
                            backgroundColor: !selectedMusic ? '#5FD5FF50' : 'transparent',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Feather name="volume-x" size={16} color="#666" />
                            <Text style={{ fontSize: 14 }}>{t('storyReader.noMusic')}</Text>
                          </View>
                        </TouchableOpacity>

                        {/* Liste des musiques */}
                        {STORY_MUSICS.map((music) => {
                          const cat = MUSIC_CATEGORIES.find((c) => c.id === music.category);
                          return (
                            <TouchableOpacity
                              key={music.id}
                              onPress={() => setSelectedMusic(music)}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: selectedMusic?.id === music.id ? '#5FD5FF50' : 'transparent',
                              }}
                            >
                              <Text style={{ fontSize: 14 }}>
                                {music.emoji} {cat ? t(cat.translationKey) + ' - ' : ''}{t(music.translationKey)}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </PlatformBlur>
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
                      backgroundColor: showFrameMenu ? '#5FD5FF' : 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 40,
                      width: 65,
                      height: 65,
                    }}
                    className='flex justify-center items-center'
                  >
                    <Feather
                      name="image"
                      size={24}
                      color="black"
                    />
                  </TouchableOpacity>

                  <FrameMenu
                    visible={showFrameMenu}
                    frameMenuAnim={frameMenuAnim}
                    isNight={isNight}
                    maxWidth={width - 30}
                    selectedFrame={selectedFrame}
                    onSelectFrame={handleSelectFrame}
                    selectedEffect={selectedEffect}
                    onSelectEffect={handleSelectEffect}
                    selectedTextStyle={selectedTextStyle}
                    onSelectTextStyle={handleSelectTextStyle}
                  />
                </View>
              </View>

              <View style={{ position: 'absolute', bottom: 16 + (isRotated ? 0 : safeBottom), left: 16 + (isRotated ? safeBottom : 0), right: 16 + (isRotated ? safeBottom : 0), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Page indicator */}
                <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }} pointerEvents="none">
                  <View style={{ backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                      {currentPageIndex + 1} / {allItems.length}
                    </Text>
                  </View>
                </View>
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
                  bottom: 175 + (isRotated ? 0 : safeBottom),
                  right: 16 + (isRotated ? safeBottom : 0),
                }}
                className='flex justify-center items-center'
              >
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>

              {/* Bouton plein écran (rotation) */}
              <TouchableOpacity
                onPress={toggleRotation}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 40,
                  width: 65,
                  height: 65,
                  position: 'absolute',
                  bottom: 95 + (isRotated ? 0 : safeBottom),
                  right: 16 + (isRotated ? safeBottom : 0),
                }}
                className='flex justify-center items-center'
              >
                <Feather
                  name={isRotated ? "minimize" : "maximize"}
                  size={24}
                  color="black"
                />
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
      </View>
    </Modal>
  );
}
