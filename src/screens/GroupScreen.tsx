import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
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
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '~/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { useGroups } from '~/hooks/useGroups';
import { useCreateGroup } from '~/hooks/useCreateGroup';
import { useGroupInvitations } from '~/hooks/useGroupInvitations';
import { useAcceptInvitation } from '~/hooks/useAcceptInvitation';
import { useDeclineInvitation } from '~/hooks/useDeclineInvitation';
import { useSearchGroups } from '~/hooks/useSearchGroups';
import { useJoinGroup } from '~/hooks/useJoinGroup';
import { useInviteToGroup } from '~/hooks/useInviteToGroup';
import { useRemoveMember } from '~/hooks/useRemoveMember';
import { useGroupMembers } from '~/hooks/useGroupMembers';
import GroupCard from '~/components/GroupCard';
import Toast from 'react-native-toast-message';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type TabType = 'myGroups' | 'search' | 'invitations';

export default function GroupScreen() {
  const { isNight } = useTheme();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('myGroups');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Animation pour la modal
  const modalTranslateY = useSharedValue(SCREEN_HEIGHT);
  const modalOpacity = useSharedValue(0);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  useEffect(() => {
    if (showGroupModal) {
      modalTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      modalOpacity.value = withTiming(1, { duration: 300 });
    } else {
      modalTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      modalOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [showGroupModal]);

  // Hooks pour les données
  const { data: myGroups = [], isLoading: isLoadingGroups } = useGroups();
  const { data: invitations = [], isLoading: isLoadingInvitations } = useGroupInvitations();
  const { data: searchResults = [], isLoading: isSearching } = useSearchGroups(searchQuery);
  const { data: groupMembers = [], isLoading: isLoadingMembers } = useGroupMembers(selectedGroup?.id || 0);

  // Hooks pour les mutations
  const createGroupMutation = useCreateGroup();
  const acceptInvitationMutation = useAcceptInvitation();
  const declineInvitationMutation = useDeclineInvitation();
  const joinGroupMutation = useJoinGroup();
  const inviteToGroupMutation = useInviteToGroup();
  const removeMemberMutation = useRemoveMember();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Le nom du groupe est requis',
      });
      return;
    }

    try {
      await createGroupMutation.mutateAsync({
        name: groupName,
        description: groupDescription,
      });
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Groupe créé avec succès',
      });
      setShowCreateModal(false);
      setGroupName('');
      setGroupDescription('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de créer le groupe',
      });
    }
  };

  const handleAcceptInvitation = async (invitationId: number) => {
    try {
      await acceptInvitationMutation.mutateAsync(invitationId);
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Invitation acceptée',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d\'accepter l\'invitation',
      });
    }
  };

  const handleRejectInvitation = async (invitationId: number) => {
    try {
      await declineInvitationMutation.mutateAsync(invitationId);
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Invitation refusée',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de refuser l\'invitation',
      });
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await joinGroupMutation.mutateAsync(groupId);
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Demande envoyée avec succès',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de rejoindre le groupe',
      });
    }
  };

  const handleInviteUser = async (groupId: number, email: string) => {
    try {
      await inviteToGroupMutation.mutateAsync({ groupId, email });
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Invitation envoyée',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d\'envoyer l\'invitation',
      });
    }
  };

  const handleRemoveMember = async (groupId: number, memberId: number) => {
    try {
      await removeMemberMutation.mutateAsync({ groupId, memberId });
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Membre exclu du groupe',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d\'exclure le membre',
      });
    }
  };

  const renderTabButton = (tab: TabType, label: string, icon: string) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className="flex-1"
    >
      <BlurView
        intensity={isNight ? 90 : 50}
        tint={isNight ? "dark" : "light"}
        className={`py-3 px-4 rounded-2xl overflow-hidden ${activeTab === tab ? 'opacity-100' : 'opacity-60'}`}
        style={{
          backgroundColor: activeTab === tab
            ? (isNight ? '#3b82f690' : '#3b82f630')
            : (isNight ? '#1e293b90' : 'transparent')
        }}
      >
        <View className="flex-row items-center justify-center gap-2">
          <Feather
            name={icon as any}
            size={18}
            color={isNight ? '#ffffff' : '#1e293b'}
          />
          <Text className={`${isNight ? 'text-white' : 'text-slate-800'} font-baloo-semibold`}>
            {label}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const handleOpenGroupModal = (group: any) => {
    setSelectedGroup(group);
    setShowGroupModal(true);
  };

  const handleCloseGroupModal = () => {
    setShowGroupModal(false);
    setSelectedGroup(null);
    setInviteEmail('');
  };

  const handleInviteFromModal = async () => {
    if (!selectedGroup || !inviteEmail.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez entrer un email',
      });
      return;
    }

    try {
      await inviteToGroupMutation.mutateAsync({ groupId: selectedGroup.id, email: inviteEmail });
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Invitation envoyée',
      });
      setInviteEmail('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d\'envoyer l\'invitation',
      });
    }
  };

  const renderMyGroupCard = (group: any) => (
    <GroupCard
      key={group.id}
      group={group}
      isNight={isNight}
      onPress={() => handleOpenGroupModal(group)}
    />
  );

  const renderSearchGroupCard = (group: any) => {
    const memberCount = group._count?.members || 0;
    return (
      <BlurView
        key={group.id}
        intensity={isNight ? 90 : 50}
        tint={isNight ? "dark" : "light"}
        className="p-4 rounded-2xl mb-3 overflow-hidden"
        style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-lg font-baloo-semibold`}>
              {group.name}
            </Text>
            <Text className={`${isNight ? 'text-white/70' : 'text-slate-600'} text-sm font-baloo mt-1`}>
              {group.description || 'Aucune description'}
            </Text>
            <View className="flex-row items-center mt-2">
              <Feather name="users" size={14} color={isNight ? '#94a3b8' : '#64748b'} />
              <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} text-xs font-baloo ml-1`}>
                {memberCount} membres
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleJoinGroup(group.id)}
            className="ml-3"
            disabled={joinGroupMutation.isPending}
          >
            <BlurView
              intensity={isNight ? 90 : 50}
              tint={isNight ? "dark" : "light"}
              className="px-4 py-2 rounded-xl overflow-hidden"
              style={{ backgroundColor: isNight ? '#3b82f690' : '#3b82f630' }}
            >
              {joinGroupMutation.isPending ? (
                <ActivityIndicator size="small" color={isNight ? '#ffffff' : '#1e293b'} />
              ) : (
                <Text className={`${isNight ? 'text-white' : 'text-blue-700'} font-baloo-semibold`}>
                  Rejoindre
                </Text>
              )}
            </BlurView>
          </TouchableOpacity>
        </View>
      </BlurView>
    );
  };

  const renderInvitationCard = (invitation: any) => {
    const isPending = invitation.status === 'PENDING';
    return (
      <BlurView
        key={invitation.id}
        intensity={isNight ? 90 : 50}
        tint={isNight ? "dark" : "light"}
        className="p-4 rounded-2xl mb-3 overflow-hidden"
        style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-lg font-baloo-semibold`}>
              {invitation.group.name}
            </Text>
            <Text className={`${isNight ? 'text-white/70' : 'text-slate-600'} text-sm font-baloo mt-1`}>
              Invitation de {invitation.inviter?.profil?.name || 'Utilisateur'}
            </Text>
          </View>
          {isPending && (
            <View className="flex-row gap-2 ml-3">
              <TouchableOpacity
                onPress={() => handleAcceptInvitation(invitation.id)}
                disabled={acceptInvitationMutation.isPending}
              >
                <BlurView
                  intensity={isNight ? 90 : 50}
                  tint={isNight ? "dark" : "light"}
                  className="p-2 rounded-xl overflow-hidden"
                  style={{ backgroundColor: isNight ? '#22c55e90' : '#22c55e30' }}
                >
                  {acceptInvitationMutation.isPending ? (
                    <ActivityIndicator size="small" color={isNight ? '#ffffff' : '#16a34a'} />
                  ) : (
                    <Feather name="check" size={20} color={isNight ? '#ffffff' : '#16a34a'} />
                  )}
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRejectInvitation(invitation.id)}
                disabled={declineInvitationMutation.isPending}
              >
                <BlurView
                  intensity={isNight ? 90 : 50}
                  tint={isNight ? "dark" : "light"}
                  className="p-2 rounded-xl overflow-hidden"
                  style={{ backgroundColor: isNight ? '#ef444490' : '#ef444430' }}
                >
                  {declineInvitationMutation.isPending ? (
                    <ActivityIndicator size="small" color={isNight ? '#ffffff' : '#dc2626'} />
                  ) : (
                    <Feather name="x" size={20} color={isNight ? '#ffffff' : '#dc2626'} />
                  )}
                </BlurView>
              </TouchableOpacity>
            </View>
          )}
          {invitation.status === 'ACCEPTED' && (
            <Text className="text-green-500 font-baloo-semibold">Acceptée</Text>
          )}
          {invitation.status === 'DECLINED' && (
            <Text className="text-red-500 font-baloo-semibold">Refusée</Text>
          )}
        </View>
      </BlurView>
    );
  };
  const renderStars = (count: number) => {
    const stars = [];
    const { width, height } = Dimensions.get('window');

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2 + 1;
      const top = Math.random() * (height * 0.5);
      const left = Math.random() * width;
      const opacity = Math.random() * 0.8 + 0.2;

      stars.push(
        <View
          key={`star-${i}`}
          style={{
            position: 'absolute',
            top,
            left,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#FFFFFF',
            opacity,
          }}
        />
      );
    }

    return stars;
  };

  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';
  return (
    <View className="flex-1 relative" style={{ backgroundColor: isNight ? '#020205' : '#87CEEB' }}>
      {isNight && renderStars(50)}
      <View
        className='absolute bottom-0 left-0 right-0 border-t-4 h-[75px] z-10 flex flex-row items-center justify-between p-4'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className=""
        >
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <SafeAreaView className="flex-1">
        <View className="flex-1 w-full px-4 pt-6">
          {/* Header */}
          <View className="pt-6 mb-4">
            <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-4xl font-baloo-semibold`}>
              Mes groupes
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2 mb-4">
            {renderTabButton('myGroups', 'Mes groupes', 'users')}
            {renderTabButton('invitations', 'Invitations', 'mail')}
          </View>

          {/* Content */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Mes groupes */}
            {activeTab === 'myGroups' && (
              <View>
                <TouchableOpacity
                  onPress={() => setShowCreateModal(true)}
                  className="mb-4"
                >
                  <BlurView
                    intensity={isNight ? 90 : 50}
                    tint={isNight ? "dark" : "light"}
                    className="p-4 rounded-2xl overflow-hidden"
                    style={{ backgroundColor: isNight ? '#3b82f690' : '#3b82f630' }}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <Feather name="plus" size={20} color={isNight ? '#ffffff' : '#1e293b'} />
                      <Text className={`${isNight ? 'text-white' : 'text-slate-800'} font-baloo-semibold text-base`}>
                        Créer un nouveau groupe
                      </Text>
                    </View>
                  </BlurView>
                </TouchableOpacity>


                {myGroups.length >= 10 && (
                  <View>
                    <BlurView
                      intensity={isNight ? 90 : 50}
                      tint={isNight ? "dark" : "light"}
                      className="mb-4 rounded-2xl overflow-hidden"
                      style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
                    >
                      <View className="flex-row items-center px-4 py-3">
                        <Feather name="search" size={20} color={isNight ? '#94a3b8' : '#64748b'} />
                        <TextInput
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          placeholder="Rechercher un groupe..."
                          placeholderTextColor={isNight ? '#94a3b8' : '#64748b'}
                          className={`flex-1 ml-3 ${isNight ? 'text-white' : 'text-slate-800'} font-baloo text-base`}
                        />
                      </View>
                    </BlurView>

                    {isSearching ? (
                      <View className="items-center py-8">
                        <ActivityIndicator size="large" color={isNight ? '#ffffff' : '#1e293b'} />
                      </View>
                    ) : searchResults.length === 0 && searchQuery.trim().length > 0 ? (
                      <BlurView
                        intensity={isNight ? 90 : 50}
                        tint={isNight ? "dark" : "light"}
                        className="p-8 rounded-2xl overflow-hidden items-center"
                        style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
                      >
                        <Feather name="search" size={48} color={isNight ? '#64748b' : '#94a3b8'} />
                        <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} font-baloo text-center mt-4`}>
                          Aucun groupe trouvé
                        </Text>
                      </BlurView>
                    ) : (
                      searchResults.map(group => renderSearchGroupCard(group))
                    )}
                  </View>)}

                {isLoadingGroups ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" color={isNight ? '#ffffff' : '#1e293b'} />
                  </View>
                ) : myGroups.length === 0 ? (
                  <BlurView
                    intensity={isNight ? 90 : 50}
                    tint={isNight ? "dark" : "light"}
                    className="p-8 rounded-2xl overflow-hidden items-center"
                    style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
                  >
                    <Feather name="users" size={48} color={isNight ? '#64748b' : '#94a3b8'} />
                    <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} font-baloo text-center mt-4`}>
                      Vous n'avez pas encore de groupe
                    </Text>
                  </BlurView>
                ) : (
                  myGroups.map(group => renderMyGroupCard(group))
                )}
              </View>
            )}

            {/* Invitations */}
            {activeTab === 'invitations' && (
              <View>
                {isLoadingInvitations ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" color={isNight ? '#ffffff' : '#1e293b'} />
                  </View>
                ) : invitations.length === 0 ? (
                  <BlurView
                    intensity={isNight ? 90 : 50}
                    tint={isNight ? "dark" : "light"}
                    className="p-8 rounded-2xl overflow-hidden items-center"
                    style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
                  >
                    <Feather name="inbox" size={48} color={isNight ? '#64748b' : '#94a3b8'} />
                    <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} font-baloo text-center mt-4`}>
                      Aucune invitation en attente
                    </Text>
                  </BlurView>
                ) : (
                  invitations.map(invitation => renderInvitationCard(invitation))
                )}
              </View>
            )}
          </ScrollView>

          {/* Modal de création de groupe */}
          {showCreateModal && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center px-4">
              <BlurView
                intensity={isNight ? 90 : 50}
                tint={isNight ? "dark" : "light"}
                className="w-full p-6 rounded-3xl overflow-hidden"
                style={{ backgroundColor: isNight ? '#1e293b' : '#ffffff' }}
              >
                <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-xl font-baloo-semibold mb-4`}>
                  Créer un groupe
                </Text>

                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="Nom du groupe"
                  placeholderTextColor={isNight ? '#94a3b8' : '#64748b'}
                  className={`${isNight ? 'text-white bg-slate-700' : 'text-slate-800 bg-slate-100'} font-baloo text-base px-4 py-3 rounded-xl mb-3`}
                />

                <TextInput
                  value={groupDescription}
                  onChangeText={setGroupDescription}
                  placeholder="Description"
                  placeholderTextColor={isNight ? '#94a3b8' : '#64748b'}
                  multiline
                  numberOfLines={3}
                  className={`${isNight ? 'text-white bg-slate-700' : 'text-slate-800 bg-slate-100'} font-baloo text-base px-4 py-3 rounded-xl mb-4`}
                  style={{ textAlignVertical: 'top' }}
                />

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setShowCreateModal(false);
                      setGroupName('');
                      setGroupDescription('');
                    }}
                    className="flex-1"
                  >
                    <View className={`${isNight ? 'bg-slate-700' : 'bg-slate-200'} py-3 rounded-xl items-center`}>
                      <Text className={`${isNight ? 'text-white' : 'text-slate-800'} font-baloo-semibold`}>
                        Annuler
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleCreateGroup}
                    className="flex-1"
                    disabled={createGroupMutation.isPending}
                  >
                    <View className="bg-blue-500 py-3 rounded-xl items-center">
                      {createGroupMutation.isPending ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text className="text-white font-baloo-semibold">
                          Créer
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          )}

          {/* Modal de détails du groupe */}
          {showGroupModal && selectedGroup && (
            <View className="absolute inset-0">
              <Animated.View
                style={[overlayAnimatedStyle, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }]}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={handleCloseGroupModal}
                  style={{ flex: 1 }}
                />
              </Animated.View>
              <Animated.View
                style={[
                  modalAnimatedStyle,
                  {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    maxHeight: SCREEN_HEIGHT * 0.9,
                    paddingHorizontal: 16,
                  }
                ]}
              >
                <BlurView
                  intensity={isNight ? 90 : 50}
                  tint={isNight ? "dark" : "light"}
                  className="w-full p-6 rounded-t-3xl overflow-hidden"
                  style={{ backgroundColor: isNight ? '#1e293b' : '#ffffff' }}
                >
                {/* Header */}
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-2xl font-baloo-semibold`}>
                      {selectedGroup.name}
                    </Text>
                    <Text className={`${isNight ? 'text-white/70' : 'text-slate-600'} text-base font-baloo mt-1`}>
                      {selectedGroup.description || 'Aucune description'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleCloseGroupModal} className="p-2">
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
                      onPress={handleInviteFromModal}
                      className="bg-blue-500 px-4 py-2 rounded-xl justify-center"
                      disabled={inviteToGroupMutation.isPending}
                    >
                      {inviteToGroupMutation.isPending ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text className="text-white font-baloo-semibold">
                          Inviter
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Liste des membres */}
                <View className="flex-1">
                  <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-lg font-baloo-semibold mb-3`}>
                    Membres du groupe
                  </Text>

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
                        const isOwner = member.role === 'OWNER' || selectedGroup.ownerId === user.id;
                        const memberName = user.profil?.name || user.email || 'Utilisateur';

                        return (
                          <BlurView
                            key={member.id}
                            intensity={isNight ? 90 : 50}
                            tint={isNight ? "dark" : "light"}
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
                                  onPress={() => handleRemoveMember(selectedGroup.id, user.id)}
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
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}