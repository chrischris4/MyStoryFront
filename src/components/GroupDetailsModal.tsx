import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/types';
import { useTheme } from '~/context/ThemeContext';
import { useAuth } from '~/context/AuthContext';
import { useGroupMembers } from '~/hooks/useGroupMembers';
import { useInviteToGroup } from '~/hooks/useInviteToGroup';
import { useRemoveMember } from '~/hooks/useRemoveMember';
import { useGroupStories } from '~/hooks/useGroupStories';
import { useSound } from '~/context/SoundContext';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type GroupDetailsModalProps = {
  visible: boolean;
  group: any;
  onClose: () => void;
};

export default function GroupDetailsModal({ visible, group, onClose }: GroupDetailsModalProps) {
  const { t } = useTranslation();
  const { isNight } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { playSound } = useSound();
  const { user: currentUser } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'stories'>('members');

  const inviteSchema = useMemo(
    () =>
      Yup.object().shape({
        inviteUsername: Yup.string()
          .trim()
          .required(t('groups.enterUsername'))
          .max(25),
      }),
    [t]
  );

  const inviteFormik = useFormik({
    initialValues: { inviteUsername: '' },
    validationSchema: inviteSchema,
    onSubmit: () => handleInvite(),
  });

  // Animation
  const modalTranslateY = useSharedValue(SCREEN_HEIGHT);
  const modalOpacity = useSharedValue(0);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  useEffect(() => {
    if (visible) {
      setIsModalMounted(true);
      modalTranslateY.value = withSpring(0, {
        damping: 50,
        stiffness: 400,
      });
      modalOpacity.value = withTiming(1, { duration: 200 });
    } else if (isModalMounted) {
      modalTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      modalOpacity.value = withTiming(0, { duration: 250 });
      setTimeout(() => {
        setIsModalMounted(false);
        inviteFormik.resetForm();
      }, 250);
    }
  }, [visible]);

  // Hooks
  const { data: fetchedMembers = [], isLoading: isLoadingMembers } = useGroupMembers(group?.id || 0);
  const { data: groupStories = [], isLoading: isLoadingStories } = useGroupStories(group?.id || 0);
  const inviteToGroupMutation = useInviteToGroup();
  const removeMemberMutation = useRemoveMember();

  const groupMembers = group?.members || fetchedMembers;
  const isCurrentUserOwner = currentUser?.id === group?.ownerId;

  const memberCount = groupMembers.length;

  const handleInvite = async () => {
    const username = inviteFormik.values.inviteUsername.trim();
    if (!username) return;

    inviteToGroupMutation.mutate(
      { groupId: group.id, name: username },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: t('groups.invitationSent'),
            text2: t('groups.invitationSentTo', { name: username }),
            props: { emoji: '📨' },
          });
          inviteFormik.resetForm();
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: error.message || t('groups.unableToInvite'),
          });
        },
      }
    );
  };

  const handleRemoveMember = (groupId: number, memberId: number) => {
    removeMemberMutation.mutate(
      { groupId, memberId },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: t('groups.memberRemoved'),
            text2: t('groups.memberRemovedMessage'),
            props: { emoji: '👋' },
          });
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: error.message || t('groups.unableToRemove'),
          });
        },
      }
    );
  };

  if (!isModalMounted || !group) {
    return null;
  }

  return (
    <View className="absolute inset-0">
      <Animated.View
        style={[
          overlayAnimatedStyle,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        ]}
      >
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View
        style={[
          modalAnimatedStyle,
          {
            position: 'absolute',
            bottom: isTablet ? SCREEN_HEIGHT * 0.2 : SCREEN_HEIGHT * 0.15,
            top: isTablet ? SCREEN_HEIGHT * 0.2 : SCREEN_HEIGHT * 0.1,
            left: isTablet ? '20%' : 0,
            right: isTablet ? '20%' : 0,
            paddingHorizontal: 16,
            zIndex: 50,
          },
        ]}
      >
        <BlurView
          intensity={90}
          tint={isNight ? 'dark' : 'light'}
          className="w-full p-6 rounded-3xl self-start overflow-hidden h-full z-50"
          style={{ backgroundColor: isNight ? '#1e293b' : '#ffffff' }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-2xl font-baloo-semibold`}>
                {group.name}
              </Text>
              <Text className={`${isNight ? 'text-white/70' : 'text-slate-600'} text-base font-baloo mt-1`}>
                {group.description || t('groups.noDescription')}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={onClose} className="p-2 -mt-3 -mr-2">
              <Feather name="x" size={24} color={isNight ? '#ffffff' : '#1e293b'} />
            </TouchableOpacity>
          </View>

          {/* Tab Buttons */}
          <View className="flex-row mb-4 gap-2">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                playSound('click');
                setActiveTab('members');
              }}
              className={`flex-1 py-3 rounded-xl ${activeTab === 'members' ? 'bg-blue-500' : isNight ? 'bg-slate-700' : 'bg-slate-200'
                }`}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Feather
                  name="users"
                  size={18}
                  color={activeTab === 'members' ? '#ffffff' : (isNight ? '#94a3b8' : '#64748b')}
                />
                <Text className={`font-baloo-semibold ${activeTab === 'members' ? 'text-white' : (isNight ? 'text-slate-400' : 'text-slate-600')
                  }`}>
                  {t('groups.members')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                playSound('click');
                setActiveTab('stories');
              }}
              className={`flex-1 py-3 rounded-xl ${activeTab === 'stories' ? 'bg-blue-500' : isNight ? 'bg-slate-700' : 'bg-slate-200'
                }`}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Feather
                  name="book"
                  size={18}
                  color={activeTab === 'stories' ? '#ffffff' : (isNight ? '#94a3b8' : '#64748b')}
                />
                <Text className={`font-baloo-semibold ${activeTab === 'stories' ? 'text-white' : (isNight ? 'text-slate-400' : 'text-slate-600')
                  }`}>
                  {t('groups.stories')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Section invitation - visible uniquement pour le owner */}
          {activeTab === 'members' && isCurrentUserOwner && (
            <View className="mb-4">
                <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-lg font-baloo-semibold`}>
                  {t('groups.inviteMember')}
                </Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={inviteFormik.values.inviteUsername}
                  onChangeText={inviteFormik.handleChange('inviteUsername')}
                  onBlur={inviteFormik.handleBlur('inviteUsername')}
                  placeholder={t('groups.usernamePlaceholder')}
                  placeholderTextColor={isNight ? '#94a3b8' : '#64748b'}
                  maxLength={25}
                  className={`flex-1 ${isNight ? 'text-white bg-slate-700' : 'text-slate-800 bg-slate-100'} font-baloo text-base px-4 py-2 rounded-xl ${inviteFormik.touched.inviteUsername && inviteFormik.errors.inviteUsername ? 'border border-red-500' : ''}`}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => inviteFormik.handleSubmit()}
                  className="bg-blue-500 px-4 py-2 rounded-xl justify-center"
                  disabled={inviteToGroupMutation.isPending}
                >
                  {inviteToGroupMutation.isPending ? (
                    <LottieView
                      source={require('../../assets/animations/LoadingWhite.json')}
                      autoPlay
                      loop={true}
                      style={{ width: 50, height: 50 }}
                    />) : (
                    <Text className="text-white font-baloo-semibold">{t('groups.invite')}</Text>
                  )}
                </TouchableOpacity>
              </View>
              {inviteFormik.touched.inviteUsername && inviteFormik.errors.inviteUsername && (
                <Text className="text-red-500 text-sm mt-1 font-baloo">{inviteFormik.errors.inviteUsername}</Text>
              )}
            </View>
          )}

          {/* Liste des membres */}
          {activeTab === 'members' && (
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-3">
                <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-lg font-baloo-semibold`}>
                  {t('groups.groupMembers')}
                </Text>
                <View className="flex-row items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full">
                  <Feather name="users" size={14} color="#3b82f6" />
                  <Text className="text-blue-500 font-baloo-semibold text-sm">
                    {memberCount}
                  </Text>
                </View>
              </View>

              {isLoadingMembers ? (
                <View className="items-center py-8">
                  <Animated.View
                    style={{
                      alignSelf: 'center',
                    }}
                  >
                    <LottieView
                      source={require('../../assets/animations/LoadingWhite.json')}
                      autoPlay
                      loop={true}
                      style={{ width: 50, height: 50 }}
                    />
                  </Animated.View>
                </View>
              ) : groupMembers.length === 0 ? (
                <View className="items-center py-8">
                  <Feather name="users" size={48} color={isNight ? '#64748b' : '#94a3b8'} />
                  <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} font-baloo text-center mt-4`}>
                    {t('groups.noMembers')}
                  </Text>
                </View>
              ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                  {groupMembers.map((member: any) => {
                    const user = member.user || member;
                    const isOwner = member.role === 'OWNER' || group.ownerId === user.id;
                    const memberName = user.profil?.name || user.email || 'Utilisateur';

                    return (
                      <BlurView
                        key={member.id}
                        intensity={90}
                        tint={isNight ? 'dark' : 'light'}
                        className="p-3 rounded-xl mb-2 overflow-hidden"
                        style={{ backgroundColor: isNight ? '#1e293b60' : '#87CEEB30' }}
                      >
                        <View className="flex-row justify-between items-center">
                          <View className="flex-1">
                            <Text className={`${isNight ? 'text-white' : 'text-slate-800'} font-baloo-semibold text-base`}>
                              {memberName}
                            </Text>
                            {isOwner && (
                              <Text className={`${isNight ? 'text-blue-400' : 'text-blue-600'} font-baloo text-sm`}>
                                {t('groups.owner')}
                              </Text>
                            )}
                          </View>

                          {!isOwner && (
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() => {
                                console.log('🔵 Remove member:', { groupId: group.id, memberId: member.id, userId: user.id });
                                handleRemoveMember(group.id, user.id);
                              }}
                              className="p-2"
                            >
                              <Feather name="user-x" size={20} color="#ef4444" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </BlurView>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          {/* Section Histoires */}
          {activeTab === 'stories' && (
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-3">
                <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-lg font-baloo-semibold`}>
                  {t('groups.groupStories')}
                </Text>
                <View className="flex-row items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full">
                  <Feather name="book" size={14} color="#3b82f6" />
                  <Text className="text-blue-500 font-baloo-semibold text-sm">
                    {groupStories.length}
                  </Text>
                </View>
              </View>

              {isLoadingStories ? (
                <View className="items-center py-8">
                  <Animated.View
                    style={{
                      alignSelf: 'center',
                    }}
                  >
                    <LottieView
                      source={require('../../assets/animations/LoadingWhite.json')}
                      autoPlay
                      loop={true}
                      style={{ width: 50, height: 50 }}
                    />
                  </Animated.View>
                </View>
              ) : groupStories.length === 0 ? (
                <View className="items-center py-8">
                  <Feather name="book-open" size={48} color={isNight ? '#64748b' : '#94a3b8'} />
                  <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} font-baloo text-center mt-4`}>
                    {t('groups.noSharedStories')}
                  </Text>
                </View>
              ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                  {groupStories.map((story: any) => {
                    const authorName = story.author?.profil?.name || story.author?.email || t('groups.unknownAuthor');

                    return (
                      <TouchableOpacity
                        key={story.id}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          playSound('click');
                          onClose();
                          navigation.navigate('StoryDetail', { storyId: story.id });
                        }}
                        activeOpacity={0.8}
                      >
                        <BlurView
                          intensity={90}
                          tint={isNight ? 'dark' : 'light'}
                          className="p-3 rounded-xl mb-2 overflow-hidden"
                          style={{ backgroundColor: isNight ? '#1e293b60' : '#87CEEB30' }}
                        >
                          <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                              <Text className={`${isNight ? 'text-white' : 'text-slate-800'} font-baloo-semibold text-base`}>
                                {story.title}
                              </Text>
                              <Text className={`${isNight ? 'text-white/60' : 'text-slate-600'} font-baloo text-sm`}>
                                {t('groups.by')} {authorName}
                              </Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={isNight ? '#94a3b8' : '#64748b'} />
                          </View>
                        </BlurView>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}
        </BlurView>
      </Animated.View>
    </View>
  );
}
