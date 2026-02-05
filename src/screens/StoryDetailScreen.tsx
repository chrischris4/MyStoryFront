import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
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
import { useQueryClient } from '@tanstack/react-query';
import { useCheckFavorite } from '~/hooks/useCheckFavorite';
import { useToggleFavorite } from '~/hooks/useToggleFavorite';
import { useGroups } from '~/hooks/useGroups';
import { useShareStoryToGroup } from '~/hooks/useShareStoryToGroup';
import { useUnshareStoryFromGroup } from '~/hooks/useUnshareStoryFromGroup';
import { useStoryGroups } from '~/hooks/useStoryGroups';
import { useDeleteStory } from '~/hooks/useDeleteStory';
import Toast from 'react-native-toast-message';
import GoBackTop, { useGoBackTop } from '~/components/GoBackTop';
import FullScreenStoryModal from '~/components/FullScreenStoryModal';
import { useSound } from '~/context/SoundContext';
import * as Haptics from 'expo-haptics';
import StarryBackground from '~/components/StarryBackground';
import { useTranslation } from 'react-i18next';
import Background from '~/components/Background';
import { useUserStore } from '~/store/useUserStore';




const LANGUAGE_FLAGS: Record<string, string> = {
  french: '\u{1F1EB}\u{1F1F7}',
  english: '\u{1F1EC}\u{1F1E7}',
  spanish: '\u{1F1EA}\u{1F1F8}',
  german: '\u{1F1E9}\u{1F1EA}',
  italian: '\u{1F1EE}\u{1F1F9}',
  portuguese: '\u{1F1F5}\u{1F1F9}',
  danish: '\u{1F1E9}\u{1F1F0}',
};

const getLanguageFlag = (language: string): string => {
  return LANGUAGE_FLAGS[language.toLowerCase()] || '\u{1F30D}';
};

type StoryDetailRouteProp = RouteProp<RootStackParamList, 'StoryDetail'>;
type StoryDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function StoryDetailScreen() {
  const navigation = useNavigation<StoryDetailNavigationProp>();
  const { t } = useTranslation();
  const route = useRoute<StoryDetailRouteProp>();
  const { isNight } = useTheme();
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
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const { handleScroll: handleGoBackTopScroll, isVisible: goBackTopVisible, opacity: goBackTopOpacity, scale: goBackTopScale } = useGoBackTop(200);

  // Hook pour les sons
  const { playSound, fadeOutBackgroundMusic } = useSound();

  // Utiliser les hooks pour les favoris
  const { data: isFavorite = false } = useCheckFavorite(Number(storyId));
  const toggleFavoriteMutation = useToggleFavorite();

  // Hooks pour les groupes
  const queryClient = useQueryClient();
  const { data: myGroups = [] } = useGroups();
  const { data: sharedGroups = [], isLoading: isLoadingSharedGroups, error: sharedGroupsError } = useStoryGroups(Number(storyId));
  const shareStoryMutation = useShareStoryToGroup();
  const unshareStoryMutation = useUnshareStoryFromGroup();
  const deleteStoryMutation = useDeleteStory();
  const skyColor = isNight ? '#020205' : '#87CEEB';
  const cloudColor = isNight ? '#A0AEC0' : '#FFFFFF';
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

  const handleShareToCommunity = async () => {
    // Si déjà partagé, ne rien faire
    if (isShared) return;

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('storyDetail.userNotAuthenticated'),
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
        setIsShared(true);
        if (story) {
          setStory({ ...story, isShared: true });
        }
        queryClient.invalidateQueries({ queryKey: ['stories'] });
        queryClient.invalidateQueries({ queryKey: ['communityStories'] });
      } else {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('storyDetail.shareStatusError'),
        });
      }
    } catch (err) {
      console.error('Erreur lors du partage:', err);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('errors.unknownError'),
      });
    }
  };

  const handleToggleGroup = (groupId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playSound('pop');

    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleShareToGroups = async () => {
    const sharedGroupIds = sharedGroups.map((g: any) => g.id);
    const newGroupsToShare = selectedGroups.filter(id => !sharedGroupIds.includes(id));
    const groupsToUnshare = sharedGroupIds.filter((id: number) => !selectedGroups.includes(id));

    if (newGroupsToShare.length === 0 && groupsToUnshare.length === 0) {
      Toast.show({
        type: 'info',
        text1: t('common.information'),
        text2: t('storyDetail.noNewGroupSelected'),
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('click');

    try {
      await Promise.all([
        ...newGroupsToShare.map(groupId =>
          shareStoryMutation.mutateAsync({
            groupId,
            storyId: Number(storyId),
          })
        ),
        ...groupsToUnshare.map((groupId: number) =>
          unshareStoryMutation.mutateAsync({
            groupId,
            storyId: Number(storyId),
          })
        ),
      ]);

      playSound('success');
      const parts = [];
      if (newGroupsToShare.length > 0) parts.push(t('storyDetail.storySharedToGroups', { count: newGroupsToShare.length }));
      if (groupsToUnshare.length > 0) parts.push(t('storyDetail.storyUnsharedFromGroups', { count: groupsToUnshare.length }));
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: parts.join(' '),
      });
      setSelectedGroups([]); // Réinitialiser la sélection après le partage
      setShowShareModal(false);
    } catch (error: any) {
      console.error('Erreur lors du partage:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error?.message || t('storyDetail.shareError'),
      });
    }
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

  // Initialiser selectedGroups avec les groupes déjà partagés quand la modal s'ouvre
  useEffect(() => {
    if (showShareModal && sharedGroups.length > 0) {
      const sharedGroupIds = sharedGroups.map((g: any) => g.id);
      setSelectedGroups(sharedGroupIds);
    }
  }, [showShareModal, sharedGroups]);

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
      <View className="flex-1 pt-10 px-4" style={{ backgroundColor: skyColor }}>
        {isNight && <StarryBackground starCount={50} />}
        {/* Skeleton Cover */}
        <BlurView
          intensity={90}
          tint={isNight ? "dark" : "light"}
          style={{
            padding: 16, borderRadius: 12,
            overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : ''
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
              className="w-5/6 relative aspect-square rounded-full self-center z-20 overflow-hidden"
            />

            {/* Skeleton Author */}
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
        </BlurView>

        {/* Skeleton Share & Like buttons */}
        <View className='flex flex-row justify-between mt-4'>
          {/* Skeleton Share Button */}
          <BlurView
            intensity={90}
            tint={isNight ? "dark" : "light"}
            style={{
              padding: 16, borderRadius: 100,
              height: 56,
              overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : ''
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
          </BlurView>

          {/* Skeleton Like Button */}
          <BlurView
            intensity={90}
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
            <Animated.View
              style={{
                opacity: skeletonAnim,
                width: 24,
                height: 24,
                backgroundColor: isNight ? '#475569' : '#cbd5e1',
                borderRadius: 12,
              }}
            />
          </BlurView>
        </View>

        {/* Ground decoration */}
        <View
          className='absolute bottom-0 -left-52 border-4 h-36 rounded-t-full w-[100%] z-0'
          style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
        />

        <View
          className='absolute bottom-0 left-0 border-t-4 h-[75px] w-full z-30 flex flex-row items-center justify-between px-8 p-4'
          style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
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
    <View className="flex-1 relative pt-10 pb-4" style={{ backgroundColor: skyColor }}>
      {/* 🌤️ Background animé */}
      <Background isNight={isNight} />
      <ScrollView
        ref={scrollViewRef}
        className="flex-grow px-4 z-20"
        contentContainerStyle={{ paddingBottom: 70 }}
        scrollEventThrottle={16}
        onScroll={handleGoBackTopScroll}
      >

        {/* Couverture */}
        <BlurView
          intensity={90}
          tint={isNight ? "dark" : "light"}
          style={{
            padding: 16, borderRadius: 12,
            overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : ''
          }}
        >
          <View className='flex flex-col'>
            <Text className={`text-3xl font-baloo-bold mb-2 mt-2 text-center ${isNight ? 'text-white' : 'text-black'}`}>{story.title}</Text>
            {story.pages[0] && (
              <View
                className='w-2/3 relative aspect-square rounded-full self-center z-20 overflow-hidden'
              >
                <Image
                  source={{ uri: story.coverUrl }}
                  resizeMode="cover"
                  className='w-full h-full'
                />
              </View>
            )}

            {story.description && (
              <Text className={`text-base font-baloo text-center mt-4 px-4 ${isNight ? 'text-white/80' : 'text-slate-600'}`}>
                {story.description}
              </Text>
            )}

            {/* Author date */}
            <View className='flex flex-row gap-2 items-center mt-4 justify-center'>
              <Text className={`text-base font-baloo-medium ${isNight ? 'text-white' : 'text-black'}`}>{t('storyDetail.author', { name: story.user?.profil?.name || t('storyDetail.anonymous') })}</Text>
              {/* <Text className="text-base font-bold text-black">{story.user?.profil?.name || 'Anonyme'}</Text> */}
            </View>
          </View>
        </BlurView>



        {/* //Share Like */}
        <View className='flex flex-row justify-between mt-4'>
          {/* Bouton de partage - visible uniquement si l'utilisateur est l'auteur */}
          {currentUser?.id === story.user?.id && (
            <BlurView
              intensity={90}
              tint={isNight ? "dark" : "light"}
              style={{
                borderRadius: 100,
                height: 56,
                paddingHorizontal: 12,
                overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : ''
              }}
              className='flex items-center justify-center'
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  playSound('pop');
                  setShowShareModal(true);
                }}
                className="flex-row gap-2 items-center px-2"
              >
                {(isShared || sharedGroups.length > 0) ? (
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
            </BlurView>
          )}
          <View className='flex flex-row gap-2'>
            <BlurView
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
                overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : ''
              }}
            >
              <Feather name="book-open" size={18} color={isNight ? '#fff' : '#64748b'} />
              <Text className={`text-base font-baloo-semibold ${isNight ? 'text-white' : 'text-slate-800'}`}>
                {story?.numberOfPages ?? story?.pages?.length ?? '-'}
              </Text>
            </BlurView>
            <BlurView
              intensity={90}
              tint={isNight ? "dark" : "light"}
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden', backgroundColor: isNight ? '#1e293b90' : ''
              }}
            >
              <Text style={{ fontSize: 22 }}>
                {getLanguageFlag(story?.language || '')}
              </Text>
            </BlurView>
            <BlurView
              intensity={90}
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
            </BlurView>
          </View>
        </View>


        {/* Button Story details  */}
        <BlurView
          intensity={90}
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
              {isExpanded ? t('storyDetail.hidePages') : t('storyDetail.showAllPages')}
            </Text>
            <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={isNight ? '#fff' : '#000'} />
          </TouchableOpacity>
        </BlurView>



        {/* PLEIN ECRAN */}
        <FullScreenStoryModal
          visible={isFullScreen}
          pages={story.pages}
          coverUrl={story.coverUrl}
          title={story.title}
          description={story.description}
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
                  {t('storyDetail.deleteStoryTitle')}
                </Text>
                <Text className="text-center text-gray-600 font-baloo">
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
                  className="bg-gray-200 p-4 rounded-xl items-center"
                >
                  <Text className="text-gray-800 font-baloo-semibold text-lg">
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de partage */}
        <Modal
          visible={showShareModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setSelectedGroups([]);
            setShowShareModal(false);
          }}
        >
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <BlurView
              intensity={90}
              tint={isNight ? "dark" : "light"}
              className="rounded-3xl p-6 mx-4 w-11/12 min-h-[70vh] max-w-md overflow-hidden"
              style={{ backgroundColor: isNight ? '#1e293b' : '#ffffff', maxHeight: '80%' }}
            >
              <View className="flex-1">
                <Text className={`text-2xl font-baloo-bold ${isNight ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {t('storyDetail.shareStoryTitle')}
                </Text>

                {/* Option: Partager à tout le monde */}
                <TouchableOpacity
                  onPress={handleShareToCommunity}
                  disabled={isShared}
                  className="mb-4"
                >
                  <BlurView
                    intensity={90}
                    tint={isNight ? "dark" : "light"}
                    className={`p-4 rounded-xl overflow-hidden ${isShared ? 'border-2 border-green-500' : ''}`}
                    style={{ backgroundColor: isShared ? (isNight ? '#22c55e50' : '#22c55e30') : (isNight ? '#3b82f690' : '#3b82f630') }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className={`font-baloo-semibold text-lg ${isNight ? 'text-white' : 'text-gray-900'}`}>
                          {isShared ? t('storyDetail.sharedToEveryone') : t('storyDetail.shareToEveryone')}
                        </Text>
                        <Text className={`font-baloo text-sm ${isNight ? 'text-gray-400' : 'text-gray-600'}`}>
                          {isShared ? t('storyDetail.alreadySharedToCommunity') : t('storyDetail.visibleByCommunity')}
                        </Text>
                      </View>
                      {isShared && (
                        <Feather name="check-circle" size={24} color="#22c55e" />
                      )}
                    </View>
                  </BlurView>
                </TouchableOpacity>

                {/* Option: Partager à des groupes */}
                <View className="flex-1 mb-4">
                  <Text className={`font-baloo-semibold text-lg ${isNight ? 'text-white' : 'text-gray-900'} mb-2`}>
                    {t('storyDetail.shareToGroups')}
                  </Text>
                  <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
                    {myGroups.length === 0 ? (
                      <BlurView
                        intensity={90}
                        tint={isNight ? "dark" : "light"}
                        className="p-4 rounded-xl overflow-hidden items-center"
                        style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
                      >
                        <Feather name="users" size={32} color={isNight ? '#64748b' : '#94a3b8'} />
                        <Text className={`${isNight ? 'text-gray-400' : 'text-gray-600'} font-baloo text-center mt-2`}>
                          {t('storyDetail.noGroupYet')}
                        </Text>
                      </BlurView>
                    ) : (
                      myGroups.map((group: any) => {
                        const isAlreadyShared = sharedGroups.some((g: any) => g.id === group.id);
                        const isSelected = selectedGroups.includes(group.id);

                        return (
                          <TouchableOpacity
                            key={group.id}
                            onPress={() => handleToggleGroup(group.id)}
                            className="mb-2"
                          >
                            <BlurView
                              intensity={90}
                              tint={isNight ? "dark" : "light"}
                              className={`p-3 rounded-xl overflow-hidden ${isSelected ? 'border-2 border-blue-500' : ''}`}
                              style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
                            >
                              <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                  <Text className={`font-baloo-semibold ${isNight ? 'text-white' : 'text-gray-900'}`}>
                                    {group.name}
                                  </Text>
                                  <Text className={`font-baloo text-sm ${isNight ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {t('storyDetail.members', { count: group._count?.members || 0 })} {isAlreadyShared ? `• ${t('storyDetail.alreadyShared')}` : ''}
                                  </Text>
                                </View>
                                {isSelected && (
                                  <Feather
                                    name="check-circle"
                                    size={20}
                                    color={isAlreadyShared ? "#10b981" : "#3b82f6"}
                                  />
                                )}
                              </View>
                            </BlurView>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </View>

              {/* Boutons d'action - en bas */}
              <View className="flex-col gap-3 pt-4">
                {(() => {
                  const sharedGroupIds = sharedGroups.map((g: any) => g.id);
                  const newGroupsCount = selectedGroups.filter(id => !sharedGroupIds.includes(id)).length;
                  const removedGroupsCount = sharedGroupIds.filter((id: number) => !selectedGroups.includes(id)).length;
                  const hasChanges = newGroupsCount > 0 || removedGroupsCount > 0;

                  return hasChanges && (
                    <TouchableOpacity
                      onPress={handleShareToGroups}
                      className={`${removedGroupsCount > 0 && newGroupsCount === 0 ? 'bg-red-500' : 'bg-blue-600'} p-4 rounded-xl items-center`}
                    >
                      <Text className="text-white font-baloo-semibold text-lg">
                        {newGroupsCount > 0 && removedGroupsCount > 0
                          ? t('storyDetail.updateGroupSharing')
                          : newGroupsCount > 0
                            ? t('storyDetail.shareToNewGroups', { count: newGroupsCount })
                            : t('storyDetail.removeFromGroups', { count: removedGroupsCount })
                        }
                      </Text>
                    </TouchableOpacity>
                  );
                })()}

                <TouchableOpacity
                  onPress={() => {
                    setSelectedGroups([]); // Réinitialiser la sélection
                    setShowShareModal(false);
                  }}
                  className={`${isNight ? 'bg-gray-700' : 'bg-gray-200'} p-4 rounded-xl items-center`}
                >
                  <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}>
                    {t('common.close')}
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>

        {isExpanded && story.pages
          .sort((a, b) => a.pageIndex - b.pageIndex)
          .map((page) => (
            <View key={page.id} className=" bg-gray-100 p-4 rounded-lg relative shadow mb-4 w-full">
              <Text style={{ maxWidth: '90%' }}
                className=" mb-2 text-sm absolute bottom-4 self-center z-20 bg-white/80 px-2 py-1 rounded-md font-baloo-medium">{page.text}</Text>
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
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            playSound('pop');
            setShowDeleteModal(true);
          }}
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
