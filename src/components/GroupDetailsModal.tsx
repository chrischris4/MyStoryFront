import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '~/context/ThemeContext';
import { useGroupMembers } from '~/hooks/useGroupMembers';
import { useInviteToGroup } from '~/hooks/useInviteToGroup';
import { useRemoveMember } from '~/hooks/useRemoveMember';
import Toast from 'react-native-toast-message';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type GroupDetailsModalProps = {
  visible: boolean;
  group: any;
  onClose: () => void;
};

export default function GroupDetailsModal({ visible, group, onClose }: GroupDetailsModalProps) {
  const { isNight } = useTheme();
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

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
        setInviteEmail('');
      }, 250);
    }
  }, [visible]);

  // Hooks
  const { data: fetchedMembers = [], isLoading: isLoadingMembers } = useGroupMembers(group?.id || 0);
  const inviteToGroupMutation = useInviteToGroup();
  const removeMemberMutation = useRemoveMember();

  const groupMembers = group?.members || fetchedMembers;
  const ownerName = group?.owner?.profil?.name || group?.owner?.email || 'Créateur inconnu';

  const memberCount = groupMembers.length;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Email requis',
        text2: 'Veuillez entrer un email',
      });
      return;
    }

    inviteToGroupMutation.mutate(
      { groupId: group.id, email: inviteEmail },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Invitation envoyée',
            text2: `Une invitation a été envoyée à ${inviteEmail}`,
          });
          setInviteEmail('');
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: 'Erreur',
            text2: error.message || 'Impossible d\'envoyer l\'invitation',
          });
        },
      }
    );
  };

  const handleRemoveMember = (groupId: number, userId: number) => {
    removeMemberMutation.mutate(
      { groupId, userId },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Membre retiré',
            text2: 'Le membre a été retiré du groupe',
          });
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: 'Erreur',
            text2: error.message || 'Impossible de retirer le membre',
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
            bottom: 100,
            top: 100,
            left: 0,
            right: 0,
            maxHeight: SCREEN_HEIGHT * 0.9,
            paddingHorizontal: 16,
            zIndex: 50,
          },
        ]}
      >
        <BlurView
          intensity={isNight ? 90 : 50}
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
              <View className="flex-row items-center gap-2 mt-1">
                <Feather name="award" size={14} color={isNight ? '#fbbf24' : '#f59e0b'} />
                <Text className={`${isNight ? 'text-yellow-400' : 'text-yellow-600'} text-sm font-baloo`}>
                  {ownerName}
                </Text>
              </View>
              <Text className={`${isNight ? 'text-white/70' : 'text-slate-600'} text-base font-baloo mt-1`}>
                {group.description || 'Aucune description'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Feather name="x" size={24} color={isNight ? '#ffffff' : '#1e293b'} />
            </TouchableOpacity>
          </View>

          {/* Section invitation */}
          <View className="mb-4">
            <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-lg font-baloo-semibold mb-3`}>
              Inviter un membre
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="Email de l'utilisateur"
                placeholderTextColor={isNight ? '#94a3b8' : '#64748b'}
                className={`flex-1 ${isNight ? 'text-white bg-slate-700' : 'text-slate-800 bg-slate-100'} font-baloo text-base px-4 py-2 rounded-xl`}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={handleInvite}
                className="bg-blue-500 px-4 py-2 rounded-xl justify-center"
                disabled={inviteToGroupMutation.isPending}
              >
                {inviteToGroupMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-baloo-semibold">Inviter</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste des membres */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-lg font-baloo-semibold`}>
                Membres du groupe
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
                <ActivityIndicator size="large" color={isNight ? '#ffffff' : '#1e293b'} />
                <Text className={`${isNight ? 'text-white' : 'text-slate-800'} font-baloo mt-2`}>
                  Chargement...
                </Text>
              </View>
            ) : groupMembers.length === 0 ? (
              <View className="items-center py-8">
                <Feather name="users" size={48} color={isNight ? '#64748b' : '#94a3b8'} />
                <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} font-baloo text-center mt-4`}>
                  Aucun membre dans ce groupe
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
                      intensity={isNight ? 90 : 50}
                      tint={isNight ? 'dark' : 'light'}
                      className="p-3 rounded-xl mb-2 overflow-hidden"
                      style={{ backgroundColor: isNight ? '#1e293b70' : '#ffffff30' }}
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text className={`${isNight ? 'text-white' : 'text-slate-800'} font-baloo-semibold text-base`}>
                            {memberName}
                          </Text>
                          {isOwner && (
                            <Text className={`${isNight ? 'text-yellow-400' : 'text-yellow-600'} font-baloo text-sm`}>
                              Propriétaire
                            </Text>
                          )}
                        </View>

                        {!isOwner && (
                          <TouchableOpacity
                            onPress={() => handleRemoveMember(group.id, user.id)}
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
        </BlurView>
      </Animated.View>
    </View>
  );
}
