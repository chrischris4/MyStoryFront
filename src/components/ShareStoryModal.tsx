import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  useWindowDimensions,
} from 'react-native';
import PlatformBlur from '~/components/PlatformBlur';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useGroups } from '~/hooks/useGroups';
import { useStoryGroups } from '~/hooks/useStoryGroups';
import { useShareStoryToGroup } from '~/hooks/useShareStoryToGroup';
import { useUnshareStoryFromGroup } from '~/hooks/useUnshareStoryFromGroup';
import { useSound } from '~/context/SoundContext';

interface ShareStoryModalProps {
  visible: boolean;
  onClose: () => void;
  storyId: number;
  isNight: boolean;
  isShared: boolean;
  onSharedToCommunity: () => void;
}

export default function ShareStoryModal({
  visible,
  onClose,
  storyId,
  isNight,
  isShared,
  onSharedToCommunity,
}: ShareStoryModalProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const { playSound } = useSound();

  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmSlideAnim = useRef(new Animated.Value(width)).current;

  const { data: myGroups = [] } = useGroups();
  const { data: sharedGroups = [] } = useStoryGroups(storyId);
  const shareStoryMutation = useShareStoryToGroup();
  const unshareStoryMutation = useUnshareStoryFromGroup();

  useEffect(() => {
    if (visible && sharedGroups.length > 0) {
      setSelectedGroups(sharedGroups.map((g: any) => g.id));
    }
  }, [visible, sharedGroups]);

  useEffect(() => {
    if (showConfirm) {
      Animated.spring(confirmSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(confirmSlideAnim, {
        toValue: width,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [showConfirm]);

  const handleShareToCommunity = async () => {
    if (isShared) return;
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Toast.show({ type: 'error', text1: t('common.error'), text2: t('storyDetail.userNotAuthenticated'), props: { emoji: '🔒' } });
        return;
      }
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/story/${storyId}/toggle-shared`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        onSharedToCommunity();
        queryClient.invalidateQueries({ queryKey: ['stories'] });
        queryClient.invalidateQueries({ queryKey: ['communityStories'] });
      } else {
        Toast.show({ type: 'error', text1: t('common.error'), text2: t('storyDetail.shareStatusError') });
      }
    } catch {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('errors.unknownError') });
    }
  };

  const handleToggleGroup = (groupId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playSound('pop');
    setSelectedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleShareToGroups = async () => {
    const sharedGroupIds = sharedGroups.map((g: any) => g.id);
    const newGroupsToShare = selectedGroups.filter(id => !sharedGroupIds.includes(id));
    const groupsToUnshare = sharedGroupIds.filter((id: number) => !selectedGroups.includes(id));

    if (newGroupsToShare.length === 0 && groupsToUnshare.length === 0) {
      Toast.show({ type: 'info', text1: t('common.information'), text2: t('storyDetail.noNewGroupSelected'), props: { emoji: 'ℹ️' } });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('click');

    try {
      await Promise.all([
        ...newGroupsToShare.map(groupId => shareStoryMutation.mutateAsync({ groupId, storyId })),
        ...groupsToUnshare.map((groupId: number) => unshareStoryMutation.mutateAsync({ groupId, storyId })),
      ]);
      playSound('success');
      const parts = [];
      if (newGroupsToShare.length > 0) parts.push(t('storyDetail.storySharedToGroups', { count: newGroupsToShare.length }));
      if (groupsToUnshare.length > 0) parts.push(t('storyDetail.storyUnsharedFromGroups', { count: groupsToUnshare.length }));
      Toast.show({ type: 'success', text1: t('common.success'), text2: parts.join(' '), props: { emoji: '📤' } });
      setSelectedGroups([]);
      onClose();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: error?.message || t('storyDetail.shareError') });
    }
  };

  const handleClose = () => {
    setSelectedGroups([]);
    onClose();
  };

  const sharedGroupIds = sharedGroups.map((g: any) => g.id);
  const newGroupsCount = selectedGroups.filter(id => !sharedGroupIds.includes(id)).length;
  const removedGroupsCount = sharedGroupIds.filter((id: number) => !selectedGroups.includes(id)).length;
  const hasChanges = newGroupsCount > 0 || removedGroupsCount > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <PlatformBlur
          intensity={90}
          tint={isNight ? 'dark' : 'light'}
          className="rounded-3xl p-6 mx-4 w-11/12 max-w-md overflow-hidden"
          style={{ backgroundColor: isNight ? '#1e293b' : '#ffffff', minHeight: '80%', maxHeight: '80%' }}
        >
          <View className="flex-1">
            <Text className={`text-2xl font-baloo-bold ${isNight ? 'text-white' : 'text-gray-900'} mb-2`}>
              {t('storyDetail.shareStoryTitle')}
            </Text>

            {/* Partager à tout le monde */}
            <TouchableOpacity onPress={() => { if (!isShared) setShowConfirm(true); }} disabled={isShared} className="mb-4">
              <PlatformBlur
                intensity={90}
                tint={isNight ? 'dark' : 'light'}
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
                  {isShared && <Feather name="check-circle" size={24} color="#22c55e" />}
                </View>
              </PlatformBlur>
            </TouchableOpacity>

            {/* Partager à des groupes */}
            <View className="flex-1 mb-4">
              <Text className={`font-baloo-semibold text-lg ${isNight ? 'text-white' : 'text-gray-900'} mb-2`}>
                {t('storyDetail.shareToGroups')}
              </Text>
              <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
                {myGroups.length === 0 ? (
                  <PlatformBlur
                    intensity={90} tint={isNight ? 'dark' : 'light'}
                    className="p-4 rounded-xl overflow-hidden items-center"
                    style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
                  >
                    <Feather name="users" size={32} color={isNight ? '#64748b' : '#94a3b8'} />
                    <Text className={`${isNight ? 'text-gray-400' : 'text-gray-600'} font-baloo text-center mt-2`}>
                      {t('storyDetail.noGroupYet')}
                    </Text>
                  </PlatformBlur>
                ) : (
                  myGroups.map((group: any) => {
                    const isAlreadyShared = sharedGroups.some((g: any) => g.id === group.id);
                    const isSelected = selectedGroups.includes(group.id);
                    return (
                      <TouchableOpacity key={group.id} onPress={() => handleToggleGroup(group.id)} className="mb-2">
                        <PlatformBlur
                          intensity={90} tint={isNight ? 'dark' : 'light'}
                          className={`p-3 rounded-xl overflow-hidden ${isSelected ? 'border-2 border-blue-500' : ''}`}
                          style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <Text className={`font-baloo-semibold ${isNight ? 'text-white' : 'text-gray-900'}`}>{group.name}</Text>
                              <Text className={`font-baloo text-sm ${isNight ? 'text-gray-400' : 'text-gray-600'}`}>
                                {t('storyDetail.members', { count: group._count?.members || 0 })}
                                {isAlreadyShared ? ` • ${t('storyDetail.alreadyShared')}` : ''}
                              </Text>
                            </View>
                            {isSelected && (
                              <Feather name="check-circle" size={20} color={isAlreadyShared ? '#10b981' : '#3b82f6'} />
                            )}
                          </View>
                        </PlatformBlur>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>

          {/* Boutons */}
          <View className="flex-col gap-3 pt-4">
            {hasChanges && (
              <TouchableOpacity
                onPress={handleShareToGroups}
                className={`${removedGroupsCount > 0 && newGroupsCount === 0 ? 'bg-red-500' : 'bg-blue-600'} p-4 rounded-xl items-center`}
              >
                <Text className="text-white font-baloo-semibold text-lg">
                  {newGroupsCount > 0 && removedGroupsCount > 0
                    ? t('storyDetail.updateGroupSharing')
                    : newGroupsCount > 0
                      ? t('storyDetail.shareToNewGroups', { count: newGroupsCount })
                      : t('storyDetail.removeFromGroups', { count: removedGroupsCount })}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClose} className={`${isNight ? 'bg-gray-700' : 'bg-gray-200'} p-4 rounded-xl items-center`}>
              <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </PlatformBlur>

        {/* Panneau de confirmation communauté */}
        <Animated.View
          pointerEvents={showConfirm ? 'auto' : 'none'}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            justifyContent: 'center',
            transform: [{ translateX: confirmSlideAnim }],
          }}
        >
          <PlatformBlur
            intensity={95} tint={isNight ? 'dark' : 'light'}
            style={{
              borderColor: isNight ? '#1e293b' : '#ffffff', borderWidth: 2,
              marginHorizontal: 16, borderRadius: 24, overflow: 'hidden',
              backgroundColor: isNight ? '#1e293b' : '#ffffff', padding: 24,
            }}
          >
            <Text className={`text-2xl font-baloo-bold ${isNight ? 'text-white' : 'text-gray-900'} mb-3`}>
              {t('storyDetail.shareToEveryoneConfirmTitle')}
            </Text>
            <Text className={`font-baloo text-base ${isNight ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              {t('storyDetail.shareToEveryoneConfirmMessage')}
            </Text>
            <Text className={`font-baloo text-sm ${isNight ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              {t('storyDetail.shareToEveryoneConfirmPermanent')}
            </Text>
            <View className={`rounded-xl p-3 mb-5 ${isNight ? 'bg-yellow-500/20' : 'bg-yellow-50'}`}>
              <Text className={`font-baloo-semibold text-sm ${isNight ? 'text-yellow-300' : 'text-yellow-700'} text-center`}>
                {t('storyDetail.shareToEveryoneConfirmBonus')}
              </Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setShowConfirm(false); handleShareToCommunity(); }}
                className="bg-blue-600 p-4 rounded-xl items-center flex-1"
              >
                <Text className="text-white font-baloo-bold text-lg">{t('storyDetail.share')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowConfirm(false)}
                className={`${isNight ? 'bg-gray-700' : 'bg-gray-200'} p-4 flex-1 rounded-xl items-center`}
              >
                <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-bold text-lg`}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </PlatformBlur>
        </Animated.View>
      </View>
    </Modal>
  );
}
