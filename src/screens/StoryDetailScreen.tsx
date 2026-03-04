import React, { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Story, RootStackParamList } from '~/types';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import PlatformBlur from '~/components/PlatformBlur';
import { useCheckFavorite } from '~/hooks/useCheckFavorite';
import { useToggleFavorite } from '~/hooks/useToggleFavorite';
import { useStoryGroups } from '~/hooks/useStoryGroups';
import { useDeleteStory } from '~/hooks/useDeleteStory';
import { useHasReportedStory } from '~/hooks/useReportStory';
import Toast from 'react-native-toast-message';
import GoBackTop, { useGoBackTop } from '~/components/GoBackTop';
import FullScreenStoryModal from '~/components/FullScreenStoryModal';
import { useSound } from '~/context/SoundContext';
import * as Haptics from 'expo-haptics';
import StarryBackground from '~/components/StarryBackground';
import { useTranslation } from 'react-i18next';
import Background from '~/components/Background';
import { useUserStore } from '~/store/useUserStore';
import ShareStoryModal from '~/components/ShareStoryModal';
import ReportStoryModal from '~/components/ReportStoryModal';


type StoryDetailRouteProp = RouteProp<RootStackParamList, 'StoryDetail'>;
type StoryDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export default function StoryDetailScreen() {
  const navigation = useNavigation<StoryDetailNavigationProp>();
  const { t } = useTranslation();
  const route = useRoute<StoryDetailRouteProp>();
  const { isNight } = useTheme();
  const { width } = useWindowDimensions();
  const { bottom: bottomInset, top: topInset } = useSafeAreaInsets();
  const isMd = width >= 768;
  const currentUser = useUserStore((state) => state.user);

  const { storyId } = route.params;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const coverFade = useRef(new Animated.Value(0)).current;
  const { handleScroll: handleGoBackTopScroll, isVisible: goBackTopVisible, opacity: goBackTopOpacity, scale: goBackTopScale } = useGoBackTop(200);

  // Hook pour les sons
  const { playSound, fadeOutBackgroundMusic } = useSound();

  // Utiliser les hooks pour les favoris
  const { data: isFavorite = false } = useCheckFavorite(Number(storyId));
  const toggleFavoriteMutation = useToggleFavorite();

  const isOwner = currentUser?.id === story?.user?.id;
  const { data: sharedGroups = [] } = useStoryGroups(isOwner ? Number(storyId) : 0);
  const deleteStoryMutation = useDeleteStory();
  const { data: hasReported = false } = useHasReportedStory(!story || isOwner ? 0 : Number(storyId));
  const [showReportModal, setShowReportModal] = useState(false);
  const skyColor = isNight ? '#020205' : '#87CEEB';
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';

  const handleToggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('click');

    toggleFavoriteMutation.mutate(
      { storyId: Number(storyId), isFavorite },
      {
        onSuccess: () => {
          // console.log('✅ Favori mis à jour avec succès');
          playSound('success');
        },
        onError: (error) => {
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: t('storyDetail.favoriteError'),
          });
          console.error('Erreur toggle favori:', error);
        },
      }
    );
  };

  const handleDeleteStory = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    playSound('click');

    deleteStoryMutation.mutate(Number(storyId), {
      onSuccess: () => {
        setShowDeleteModal(false);
        playSound('success');
        Toast.show({
          type: 'success',
          text1: t('common.success'),
          text2: t('storyDetail.storyDeleted'),
          props: { emoji: '🗑️' },
        });
        setTimeout(() => {
          navigation.navigate('MainTabs');
        }, 1000);
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: error.message || t('storyDetail.deleteError'),
        });
      },
    });
  };


  const fetchStory = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error(t('storyDetail.userNotAuthenticated'));

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/story/detail/${storyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: data.message || t('storyDetail.accessDenied'),
        });
        navigation.goBack();
        return;
      }

      if (!response.ok) {
        throw new Error(t('storyDetail.fetchError'));
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
    if (!loading && story) {
      Animated.timing(coverFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, story]);

  // Animation pour le skeleton
  const skeletonAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  if (loading) {
    return (
      <View className="flex-1 px-4 md:px-8" style={{ backgroundColor: skyColor, paddingTop: 20 + (Platform.OS === 'android' ? topInset : 0) }}>
        {isNight && <StarryBackground starCount={50} />}
        {/* Skeleton Cover */}
        <PlatformBlur
          intensity={90}
          tint={isNight ? "dark" : "light"}
          style={{
            padding: 16, borderRadius: 12,
            overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : '#38b6ff10'
          }}
        >
          <View className='flex flex-col items-center'>
            {/* Skeleton Title */}
            <Animated.View
              style={{
                opacity: skeletonAnim,
                width: '60%',
                height: 32,
                backgroundColor: isNight ? '#475569' : '#cbd5e1',
                borderRadius: 8,
                marginBottom: 16,
              }}
            />

            {/* Skeleton Cover Image */}
            <Animated.View
              style={{
                opacity: skeletonAnim,
                backgroundColor: isNight ? '#475569' : '#cbd5e1',
              }}
              className="w-2/3 md:w-3/5 relative aspect-square rounded-full self-center z-20 overflow-hidden"
            />

            {/* Skeleton Author */}
            <Animated.View
              style={{
                opacity: skeletonAnim,
                width: '75%',
                height: 20,
                backgroundColor: isNight ? '#475569' : '#cbd5e1',
                borderRadius: 6,
                marginTop: 16,
              }}
            />
            <Animated.View
              style={{
                opacity: skeletonAnim,
                width: '40%',
                height: 20,
                backgroundColor: isNight ? '#475569' : '#cbd5e1',
                borderRadius: 6,
                marginTop: 16,
              }}
            />

            {/* Skeleton Date */}
            <Animated.View
              style={{
                opacity: skeletonAnim,
                width: '25%',
                height: 16,
                backgroundColor: isNight ? '#475569' : '#cbd5e1',
                borderRadius: 6,
                marginTop: 12,
              }}
            />
          </View>
        </PlatformBlur>

        {/* Skeleton Share & Like buttons */}
        <View className='flex flex-row justify-between mt-4'>
          {/* Skeleton Share Button */}
          <PlatformBlur
            intensity={90}
            tint={isNight ? "dark" : "light"}
            style={{
              padding: 16, borderRadius: 100,
              height: 56,
              overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : '#38b6ff10'
            }}
          >
            <Animated.View
              style={{
                opacity: skeletonAnim,
                width: 100,
                height: 24,
                backgroundColor: isNight ? '#475569' : '#cbd5e1',
                borderRadius: 12,
              }}
            />
          </PlatformBlur>

          {/* Skeleton Like Button */}
          <View className='flex flex-row gap-3'>
            <PlatformBlur
              intensity={90}
              tint={isNight ? "dark" : "light"}
              style={{
                padding: 16, width: 56,
                height: 56,
                borderRadius: 9999,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : '#38b6ff10'
              }}
            >
              <Animated.View
                style={{
                  opacity: skeletonAnim,
                  width: 24,
                  height: 24,
                  backgroundColor: isNight ? '#475569' : '#cbd5e1',
                  borderRadius: 12,
                }}
              />
            </PlatformBlur>
            <PlatformBlur
              intensity={90}
              tint={isNight ? "dark" : "light"}
              style={{
                padding: 16, width: 56,
                height: 56,
                borderRadius: 9999,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : '#38b6ff10'
              }}
            >
              <Animated.View
                style={{
                  opacity: skeletonAnim,
                  width: 24,
                  height: 24,
                  backgroundColor: isNight ? '#475569' : '#cbd5e1',
                  borderRadius: 12,
                }}
              />
            </PlatformBlur>
          </View>
        </View>
        <View
          className='absolute bottom-0 left-0 border-t-4 h-[75px] w-full z-30 flex flex-row items-center justify-between px-8 p-4'
          style={{ backgroundColor: groundColor, borderColor: groundBorderColor, bottom: bottomInset }}
        />
      </View>
    );
  }

  if (error || !story) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error ?? t('storyDetail.storyNotFound')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative pb-4" style={{ backgroundColor: skyColor, paddingTop: 20 + (Platform.OS === 'android' ? topInset : 0) }}>
      {/* 🌤️ Background animé */}
      <Background isNight={isNight} />
      <ScrollView
        ref={scrollViewRef}
        className="flex-grow px-4 md:px-8 z-10"
        contentContainerStyle={{ paddingBottom: 70 + bottomInset }}
        scrollEventThrottle={16}
        onScroll={handleGoBackTopScroll}
        showsVerticalScrollIndicator={false}
      >

        {/* Couverture */}
        <PlatformBlur
          intensity={90}
          tint={isNight ? "dark" : "light"}
          style={{
            padding: 16, borderRadius: 12,
            overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : '#38b6ff10'
          }}
        >
          <View className='flex flex-col'>
            <Text className={`text-3xl md:text-4xl font-baloo-bold mb-2 mt-2 md:pt-4 text-center ${isNight ? 'text-white' : 'text-black'}`}>{story.title}</Text>
            {story.pages[0] && (
              <Animated.View
                className='w-2/3 md:w-3/5 relative aspect-square rounded-full self-center z-20 overflow-hidden'
                style={{ opacity: coverFade }}
              >
                <Image
                  source={{ uri: story.coverUrl }}
                  resizeMode="cover"
                  className='w-full h-full'
                />
              </Animated.View>
            )}

            {story.description && (
              <Text className={`text-base self-center md:text-lg md:w-10/12 font-baloo text-center mt-4 px-4 ${isNight ? 'text-white/80' : 'text-slate-600'}`}>
                {story.description}
              </Text>
            )}

            {/* Author date */}
            <View className='flex flex-row gap-2 items-center mt-4 justify-center'>
              <Text className={`text-base md:text-lg font-baloo-medium ${isNight ? 'text-white' : 'text-black'}`}>{t('storyDetail.author', { name: story.user?.profil?.name || t('storyDetail.anonymous') })}</Text>
              {/* <Text className="text-base font-bold text-black">{story.user?.profil?.name || 'Anonyme'}</Text> */}
            </View>
          </View>
        </PlatformBlur>



        {/* //Share Like */}
        <View className='flex flex-row justify-between mt-4'>
          {/* Bouton de partage (owner) ou Report (non-owner) */}
          {isOwner ? (
            <PlatformBlur
              intensity={90}
              tint={isNight ? "dark" : "light"}
              style={{
                borderRadius: 100,
                height: 56,
                paddingHorizontal: 12,
                overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : '#38b6ff10'
              }}
              className='flex items-center justify-center'
            >
              <TouchableOpacity
                onPress={() => {
                  if (!story.canBeShared) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  playSound('pop');
                  setShowShareModal(true);
                }}
                className="flex-row gap-2 items-center px-2"
                disabled={!story.canBeShared}
              >
                {!story.canBeShared ? (
                  <>
                    <Feather name='alert-circle' size={18} color="#ef4444" />
                    <Text className="text-lg font-baloo-semibold text-red-500">
                      {t('storyDetail.reported')}
                    </Text>
                  </>
                ) : (isShared || sharedGroups.length > 0) ? (
                  <>
                    <Text className={`text-lg font-baloo-semibold ${isNight ? 'text-white' : 'text-black'}`}>
                      {t('storyDetail.shared')}
                    </Text>
                    {isShared && (
                      <Feather name='globe' size={18} color={isNight ? '#fff' : '#000'} />
                    )}
                    {sharedGroups.length > 0 && (
                      <View className="flex-row items-center gap-1">
                        <Feather name='users' size={18} color={isNight ? '#fff' : '#000'} />
                        <Text className={`text-base font-baloo-medium ${isNight ? 'text-white' : 'text-black'}`}>
                          {sharedGroups.length}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <Feather name='share' size={18} color={isNight ? '#fff' : '#000'} />
                    <Text className={`text-lg font-baloo-semibold ${isNight ? 'text-white' : 'text-black'}`}>
                      {t('storyDetail.share')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </PlatformBlur>
          ) : (
            <PlatformBlur
              intensity={90}
              tint={isNight ? "dark" : "light"}
              style={{
                borderRadius: 100,
                height: 56,
                paddingHorizontal: 12,
                overflow: 'hidden', backgroundColor: hasReported ? (isNight ? '#22c55e20' : '#22c55e30') : (isNight ? '#1e293b90' : '#38b6ff10')
              }}
              className='flex items-center justify-center'
            >
              <TouchableOpacity
                onPress={() => {
                  if (hasReported) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  playSound('pop');
                  setShowReportModal(true);
                }}
                disabled={hasReported}
                className="flex-row gap-2 items-center px-2"
              >
                <Feather name={hasReported ? 'check-circle' : 'flag'} size={18} color={hasReported ? '#22c55e' : '#ef4444'} />
                <Text className={`text-lg font-baloo-semibold ${hasReported ? 'text-green-500' : 'text-red-500'}`}>
                  {hasReported ? t('report.alreadyReported') : t('report.report')}
                </Text>
              </TouchableOpacity>
            </PlatformBlur>
          )}
          <View className='flex flex-row gap-2'>
            <PlatformBlur
              intensity={90}
              tint={isNight ? "dark" : "light"}
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                flexDirection: 'row',
                gap: 3,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : '#38b6ff10'
              }}
            >
              <Feather name="book-open" size={18} color={isNight ? '#fff' : '#64748b'} />
              <Text className={`text-base font-baloo-semibold ${isNight ? 'text-white' : 'text-slate-800'}`}>
                {story?.numberOfPages ?? story?.pages?.length ?? '-'}
              </Text>
            </PlatformBlur>
            <PlatformBlur
              intensity={90}
              tint={isNight ? "dark" : "light"}
              style={{
                padding: 16, width: 56,
                height: 56,
                borderRadius: 9999,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : '#38b6ff10'
              }}

            >
              <TouchableOpacity
                onPress={handleToggleFavorite}
                disabled={toggleFavoriteMutation.isPending}
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MaterialIcons name={isFavorite ? 'favorite' : 'favorite-border'} size={20} color="red" />
              </TouchableOpacity>
            </PlatformBlur>
          </View>
        </View>


        {/* Button Story details  */}
        <PlatformBlur
          intensity={90}
          tint={isNight ? "dark" : "light"}
          style={{
            borderRadius: 9999,
            marginTop: 16,
            marginBottom: 16,
            overflow: 'hidden',
            backgroundColor: isNight ? '#1e293b90' : '#38b6ff10'
          }}
        >
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            className="p-4 flex-row gap-2 items-center justify-center"
          >
            <Text className={`text-lg font-baloo-semibold ${isNight ? 'text-white' : 'text-black'}`}>
              {isExpanded ? t('storyDetail.hidePages') : t('storyDetail.showAllPages')}
            </Text>
            <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={isNight ? '#fff' : '#000'} />
          </TouchableOpacity>
        </PlatformBlur>



        {/* PLEIN ECRAN */}
        <FullScreenStoryModal
          visible={isFullScreen}
          pages={story.pages}
          coverUrl={story.coverUrl}
          title={story.title}
          description={story.description}
          author={story.user?.profil?.name}
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
            <View className={`${isNight ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 mx-4 w-11/12 max-w-md`}>
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

                <Text className={`text-2xl font-baloo-bold mb-2 ${isNight ? 'text-white' : 'text-gray-900'}`}>
                  {t('storyDetail.deleteStoryTitle')}
                </Text>
                <Text className={`text-center font-baloo ${isNight ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('storyDetail.deleteStoryMessage', { title: story?.title })}
                </Text>
              </View>

              <View className="flex-col gap-3">
                <TouchableOpacity
                  onPress={handleDeleteStory}
                  className="bg-red-600 p-4 rounded-xl items-center"
                >
                  <Text className="text-white font-baloo-semibold text-lg">
                    {t('storyDetail.yesDelete')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    playSound('pop');
                    setShowDeleteModal(false);
                  }}
                  className={`${isNight ? 'bg-slate-600' : 'bg-gray-200'} p-4 rounded-xl items-center`}
                >
                  <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {isOwner && (
          <ShareStoryModal
            visible={showShareModal}
            onClose={() => setShowShareModal(false)}
            storyId={Number(storyId)}
            isNight={isNight}
            isShared={isShared}
            onSharedToCommunity={() => {
              setIsShared(true);
              setStory(prev => prev ? { ...prev, isShared: true } : prev);
            }}
          />
        )}

        <ReportStoryModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          storyId={Number(storyId)}
          isNight={isNight}
        />

        {isExpanded && story.pages
          .sort((a, b) => a.pageIndex - b.pageIndex)
          .map((page) => (
            <View key={page.id} className=" bg-gray-100 p-4 rounded-lg relative shadow mb-4 w-full">
              <Text style={{ maxWidth: '90%' }}
                className=" mb-2 text-xs md:text-sm absolute bottom-4 self-center z-20 bg-white/80 px-2 py-1 rounded-md font-baloo-medium">{page.text}</Text>
              <Image
                source={{ uri: page.imageUrl }}
                style={{ width: '100%', height: isMd ? 350 : 200, borderRadius: 10 }}
                resizeMode="cover"
              />
            </View>
          ))}
      </ScrollView>
      {/* Navbar */}
      <View
        className='absolute bottom-0 left-0 border-t-4 h-[75px] w-full z-30'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor, bottom: bottomInset }}
      >
        <View className="flex flex-row relative w-full h-full items-center justify-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="px-2 md:px-4 absolute left-6"
        >
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            playSound('click');
            fadeOutBackgroundMusic(800);
            setIsFullScreen(true);
          }}
          className="bg-yellow-800 self-center z-30 flex flex-row h-[50px] px-6 gap-2 items-center justify-center rounded-full">
          <Text className='text-white text-lg font-baloo-medium'>{t('storyDetail.readFullscreen')} </Text>
          <Feather name="play" size={20} color="white" />
        </TouchableOpacity>
        {currentUser?.id === story.user?.id && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              playSound('pop');
              setShowDeleteModal(true);
            }}
            className='px-2 md:px-4 absolute right-6'
          >
            <Feather name="trash-2" size={24} color="white" />
          </TouchableOpacity>
        )}
        </View>
      </View>

      {/* Bouton retour en haut */}
      <GoBackTop
        scrollViewRef={scrollViewRef}
        showAfter={200}
        onScroll={handleGoBackTopScroll}
        isVisible={goBackTopVisible}
        opacity={goBackTopOpacity}
        scale={goBackTopScale}
        isNight={isNight}
      />
    </View>
  );
}
