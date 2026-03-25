import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '~/context/ThemeContext';
import { useAuth } from '~/context/AuthContext';
import PlatformBlur from '~/components/PlatformBlur';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useGroups } from '~/hooks/useGroups';
import { useCreateGroup } from '~/hooks/useCreateGroup';
import { useGroupInvitations } from '~/hooks/useGroupInvitations';
import { useAcceptInvitation } from '~/hooks/useAcceptInvitation';
import { useDeclineInvitation } from '~/hooks/useDeclineInvitation';
import { useSearchGroups } from '~/hooks/useSearchGroups';
import { useJoinGroup } from '~/hooks/useJoinGroup';
import GroupCard from '~/components/GroupCard';
import GroupDetailsModal from '~/components/GroupDetailsModal';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import Background from '~/components/Background';

type TabType = 'myGroups' | 'search' | 'invitations';

export default function GroupScreen() {
  const { t } = useTranslation();
  const { isNight } = useTheme();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const navigation = useNavigation();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('myGroups');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const createModalOpacity = useRef(new Animated.Value(0)).current;
  const createModalScale = useRef(new Animated.Value(0.9)).current;

  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
    Animated.parallel([
      Animated.timing(createModalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(createModalScale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 8 }),
    ]).start();
  }, []);

  const closeCreateModal = useCallback(() => {
    Animated.timing(createModalOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setShowCreateModal(false);
      createModalScale.setValue(0.9);
    });
  }, []);

  const createGroupSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('groups.groupNameRequired'))
      .max(25, t('groups.groupNameMaxLength', { max: 25 })),
    description: Yup.string()
      .max(100, t('groups.descriptionMaxLength', { max: 100 })),
  });
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Hooks pour les données
  const { data: myGroups = [], isLoading: isLoadingGroups, refetch: refetchGroups, isRefetching: isRefetchingGroups } = useGroups();
  const { data: invitations = [], isLoading: isLoadingInvitations, refetch: refetchInvitations, isRefetching: isRefetchingInvitations } = useGroupInvitations();
  const { data: searchResults = [], isLoading: isSearching } = useSearchGroups(searchQuery);

  // Hooks pour les mutations
  const createGroupMutation = useCreateGroup();
  const acceptInvitationMutation = useAcceptInvitation();
  const declineInvitationMutation = useDeclineInvitation();
  const joinGroupMutation = useJoinGroup();

  const handleCreateGroup = async (
    values: { name: string; description: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await createGroupMutation.mutateAsync({
        name: values.name,
        description: values.description,
      });
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('groups.groupCreated'),
        props: { emoji: '🎉' },
      });
      closeCreateModal();
      resetForm();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('groups.createGroupError'),
      });
    }
  };

  const handleAcceptInvitation = async (invitationId: number) => {
    try {
      await acceptInvitationMutation.mutateAsync(invitationId);
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('groups.invitationAccepted'),
        props: { emoji: '🤝' },
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('groups.acceptInvitationError'),
      });
    }
  };

  const handleRejectInvitation = async (invitationId: number) => {
    try {
      await declineInvitationMutation.mutateAsync(invitationId);
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('groups.invitationDeclined'),
        props: { emoji: '👋' },
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('groups.declineInvitationError'),
      });
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await joinGroupMutation.mutateAsync(groupId);
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('groups.joinRequestSent'),
        props: { emoji: '📨' },
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('groups.joinGroupError'),
      });
    }
  };


  const pendingInvitationsCount = invitations.filter((inv: any) => inv.status === 'PENDING').length;

  const renderTabButton = (tab: TabType, label: string, icon: string, badgeCount?: number) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setActiveTab(tab)}
      className="flex-1"
    >
      <PlatformBlur
        intensity={90}
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
          <Text className={`${isNight ? 'text-white' : 'text-slate-800'} font-baloo-semibold text-base md:text-lg`}>
            {label}
          </Text>
          {!!badgeCount && badgeCount > 0 && (
            <View className="bg-red-500 rounded-full min-w-[20px] h-[20px] items-center justify-center px-1 z-10">
              <Text className="text-white text-sm -mb-[2px] font-baloo-bold">{badgeCount > 99 ? '99+' : badgeCount}</Text>
            </View>
          )}
        </View>
      </PlatformBlur>
    </TouchableOpacity>
  );

  const handleOpenGroupModal = (group: any) => {
    setSelectedGroup(group);
    setShowGroupModal(true);
  };

  const handleCloseGroupModal = () => {
    setShowGroupModal(false);
  };


  const renderMyGroupCard = (group: any) => (
    <GroupCard
      key={group.id}
      group={group}
      isNight={isNight}
      onPress={() => handleOpenGroupModal(group)}
      isOwner={user?.id === group.ownerId}
    />
  );

  const renderSearchGroupCard = (group: any) => {
    const memberCount = group._count?.members || 0;
    return (
      <PlatformBlur
        key={group.id}
        intensity={90}
        tint={isNight ? "dark" : "light"}
        className="p-4 rounded-2xl mb-3 overflow-hidden"
        style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-lg font-baloo-semibold`}>
              {group.name}
            </Text>
            <Text className={`${isNight ? 'text-white/70' : 'text-slate-600'} text-sm font-baloo mt-1`}>
              {group.description || t('groups.noDescription')}
            </Text>
            <View className="flex-row items-center mt-2">
              <Feather name="users" size={14} color={isNight ? '#94a3b8' : '#64748b'} />
              <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} text-xs font-baloo ml-1`}>
                {memberCount} {t('groups.members')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleJoinGroup(group.id)}
            className="ml-3"
            disabled={joinGroupMutation.isPending}
          >
            <PlatformBlur
              intensity={90}
              tint={isNight ? "dark" : "light"}
              className="px-4 py-2 rounded-xl overflow-hidden"
              style={{ backgroundColor: isNight ? '#3b82f690' : '#3b82f630' }}
            >
              {joinGroupMutation.isPending ? (
                <LottieView
                  source={require('../../assets/animations/LoadingWhite.json')}
                  autoPlay
                  loop={true}
                  style={{ width: 100, height: 100 }}
                />
              ) : (
                <Text className={`${isNight ? 'text-white' : 'text-blue-700'} font-baloo-semibold`}>
                  {t('groups.join')}
                </Text>
              )}
            </PlatformBlur>
          </TouchableOpacity>
        </View>
      </PlatformBlur>
    );
  };

  const renderInvitationCard = (invitation: any) => {
    const isPending = invitation.status === 'PENDING';
    return (
      <PlatformBlur
        key={invitation.id}
        intensity={90}
        tint={isNight ? "dark" : "light"}
        className="p-4 rounded-2xl mb-3 overflow-hidden"
        style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-lg font-baloo-semibold`}>
              {invitation.group.name}
            </Text>
            <Text className={`${isNight ? 'text-white/70' : 'text-slate-600'} text-sm font-baloo mt-1`}>
              {t('groups.invitationFrom')} {invitation.inviter?.profil?.name || t('groups.user')}
            </Text>
          </View>
          {isPending && (
            <View className="flex-row h-full items-center gap-2 ml-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleAcceptInvitation(invitation.id)}
                disabled={acceptInvitationMutation.isPending}
              >
                <PlatformBlur
                  intensity={90}
                  tint={isNight ? "dark" : "light"}
                  className="p-2 rounded-xl overflow-hidden"
                  style={{ backgroundColor: isNight ? '#22c55e90' : '#22c55e30' }}
                >
                  {acceptInvitationMutation.isPending ? (
                    <Feather name="check" size={20} color={isNight ? '#ffffff' : '#16a34a50'} />

                  ) : (
                    <Feather name="check" size={20} color={isNight ? '#ffffff' : '#16a34a'} />
                  )}
                </PlatformBlur>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleRejectInvitation(invitation.id)}
                disabled={declineInvitationMutation.isPending}
              >
                <PlatformBlur
                  intensity={90}
                  tint={isNight ? "dark" : "light"}
                  className="p-2 rounded-xl overflow-hidden"
                  style={{ backgroundColor: isNight ? '#ef444490' : '#ef444430' }}
                >
                  {declineInvitationMutation.isPending ? (
                    <Feather name="x" size={20} color={isNight ? '#ffffff' : '#dc262650'} />

                  ) : (
                    <Feather name="x" size={20} color={isNight ? '#ffffff' : '#dc2626'} />
                  )}
                </PlatformBlur>
              </TouchableOpacity>
            </View>
          )}
          {invitation.status === 'ACCEPTED' && (
            <Text className="text-green-500 font-baloo-semibold">{t('groups.accepted')}</Text>
          )}
          {invitation.status === 'DECLINED' && (
            <Text className="text-red-500 font-baloo-semibold">{t('groups.declined')}</Text>
          )}
        </View>
      </PlatformBlur>
    );
  };
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';

  return (
    <View className="flex-1 relative" style={{ backgroundColor: isNight ? '#020205' : '#87CEEB' }}>
      {/* 🌤️ Background animé */}
      <Background isNight={isNight} />

      <View
        className='absolute bottom-0 left-0 right-0 border-t-4 h-[75px] flex flex-row items-center justify-between p-4 z-30'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor, bottom: bottomInset }}
      >
        <View style={{ position: 'absolute', top: '100%', left: 0, right: 0, height: 200, backgroundColor: groundColor }} />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          className="px-4"
        >
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <SafeAreaView className="flex-1">
        <View className="flex-1 w-full px-4 md:px-8 pt-4">
          {/* Header */}
          <View className="mb-4">
            <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-4xl md:text-5xl font-baloo-semibold pt-4`}>
              {t('groups.myGroups')}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2 mb-4">
            {renderTabButton('myGroups', t('groups.myGroups'), 'users')}
            {renderTabButton('invitations', t('groups.invitations'), 'mail', pendingInvitationsCount)}
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 + bottomInset }}
            refreshControl={
              <RefreshControl
                refreshing={activeTab === 'myGroups' ? isRefetchingGroups : isRefetchingInvitations}
                onRefresh={() => {
                  if (activeTab === 'myGroups') {
                    refetchGroups();
                  } else {
                    refetchInvitations();
                  }
                }}
                tintColor='#ffffff'
              />
            }
          >
            {/* Mes groupes */}
            {activeTab === 'myGroups' && (
              <View className='mb-24'>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={openCreateModal}
                  className="mb-4"
                >
                  <PlatformBlur
                    intensity={90}
                    tint={isNight ? "dark" : "light"}
                    className="p-4 rounded-2xl overflow-hidden"
                    style={{ backgroundColor: isNight ? '#3b82f690' : '#3b82f630' }}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <Feather name="plus" size={20} color={isNight ? '#ffffff' : '#1e293b'} />
                      <Text className={`${isNight ? 'text-white' : 'text-slate-800'} font-baloo-semibold text-base md:text-lg`}>
                        {t('groups.createNewGroup')}
                      </Text>
                    </View>
                  </PlatformBlur>
                </TouchableOpacity>


                {myGroups.length >= 10 && (
                  <View>
                    <PlatformBlur
                      intensity={90}
                      tint={isNight ? "dark" : "light"}
                      className="mb-4 rounded-2xl overflow-hidden"
                      style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
                    >
                      <View className="flex-row items-center px-4 py-3">
                        <Feather name="search" size={20} color={isNight ? '#94a3b8' : '#64748b'} />
                        <TextInput
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          placeholder={t('groups.searchPlaceholder')}
                          placeholderTextColor={isNight ? '#94a3b8' : '#64748b'}
                          className={`flex-1 ml-3 ${isNight ? 'text-white' : 'text-slate-800'} font-baloo text-base`}
                        />
                      </View>
                    </PlatformBlur>

                    {isSearching ? (
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
                            style={{ width: 100, height: 100 }}
                          />
                        </Animated.View>
                      </View>
                    ) : searchResults.length === 0 && searchQuery.trim().length > 0 ? (
                      <PlatformBlur
                        intensity={90}
                        tint={isNight ? "dark" : "light"}
                        className="p-8 rounded-2xl overflow-hidden items-center"
                        style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
                      >
                        <Feather name="search" size={48} color={isNight ? '#64748b' : '#94a3b8'} />
                        <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} font-baloo text-center mt-4`}>
                          {t('groups.noGroupFound')}
                        </Text>
                      </PlatformBlur>
                    ) : (
                      searchResults.map(group => renderSearchGroupCard(group))
                    )}
                  </View>)}

                {isLoadingGroups ? (
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
                        style={{ width: 100, height: 100 }}
                      />
                    </Animated.View>
                  </View>
                ) : myGroups.length === 0 ? (
                  <PlatformBlur
                    intensity={90}
                    tint={isNight ? "dark" : "light"}
                    className="p-8 rounded-2xl overflow-hidden items-center"
                    style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
                  >
                    <Feather name="users" size={48} color={isNight ? '#64748b' : '#94a3b8'} />
                    <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} font-baloo text-center mt-4`}>
                      {t('groups.noGroupYet')}
                    </Text>
                  </PlatformBlur>
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
                    <Animated.View
                      style={{
                        alignSelf: 'center',
                      }}
                    >
                      <LottieView
                        source={require('../../assets/animations/LoadingWhite.json')}
                        autoPlay
                        loop={true}
                        style={{ width: 100, height: 100 }}
                      />
                    </Animated.View>
                  </View>
                ) : invitations.length === 0 ? (
                  <PlatformBlur
                    intensity={90}
                    tint={isNight ? "dark" : "light"}
                    className="p-8 rounded-2xl overflow-hidden items-center"
                    style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}
                  >
                    <Feather name="inbox" size={48} color={isNight ? '#64748b' : '#94a3b8'} />
                    <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} font-baloo text-center mt-4`}>
                      {t('groups.noInvitations')}
                    </Text>
                  </PlatformBlur>
                ) : (
                  invitations.map(invitation => renderInvitationCard(invitation))
                )}
              </View>
            )}
          </ScrollView>

          {/* Modal de création de groupe */}
          {showCreateModal && (
            <Animated.View
              className="absolute inset-0 items-center justify-center px-4"
              style={{ opacity: createModalOpacity, backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <TouchableWithoutFeedback onPress={closeCreateModal}>
                <View className="absolute inset-0" />
              </TouchableWithoutFeedback>
              <Animated.View style={{ transform: [{ scale: createModalScale }], width: isTablet ? '60%' : '100%' }}>
                <PlatformBlur
                  intensity={90}
                  tint={isNight ? "dark" : "light"}
                  className="w-full p-6 rounded-3xl overflow-hidden"
                  style={{ backgroundColor: isNight ? '#1e293b' : '#ffffff' }}
                >
                  <Text className={`${isNight ? 'text-white' : 'text-slate-800'} text-xl md:text-2xl font-baloo-semibold mb-4`}>
                    {t('groups.createGroup')}
                  </Text>
                  <Formik
                    initialValues={{ name: '', description: '' }}
                    validationSchema={createGroupSchema}
                    onSubmit={handleCreateGroup}
                  >
                    {({ handleChange, handleSubmit, values, errors, touched }) => (
                      <>
                        <View className="mb-3">
                          <TextInput
                            value={values.name}
                            onChangeText={handleChange('name')}
                            placeholder={t('groups.groupName')}
                            placeholderTextColor={isNight ? '#94a3b8' : '#64748b'}
                            maxLength={25}
                            className={`${isNight ? 'text-white bg-slate-700' : 'text-slate-800 bg-slate-100'} font-baloo text-base px-4 py-3 rounded-xl ${touched.name && errors.name ? 'border border-red-500' : ''}`}
                          />
                          <View className="flex-row justify-between mt-1 px-1">
                            {touched.name && errors.name ? (
                              <Text className="text-red-500 text-sm font-baloo">{errors.name}</Text>
                            ) : (
                              <View />
                            )}
                            <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} text-xs font-baloo`}>
                              {values.name.length}/25
                            </Text>
                          </View>
                        </View>

                        <View className="mb-4">
                          <TextInput
                            value={values.description}
                            onChangeText={handleChange('description')}
                            placeholder={t('groups.description')}
                            placeholderTextColor={isNight ? '#94a3b8' : '#64748b'}
                            multiline
                            numberOfLines={3}
                            maxLength={100}
                            className={`${isNight ? 'text-white bg-slate-700' : 'text-slate-800 bg-slate-100'} font-baloo text-base px-4 py-3 rounded-xl ${touched.description && errors.description ? 'border border-red-500' : ''}`}
                            style={{ textAlignVertical: 'top' }}
                          />
                          <View className="flex-row justify-between mt-1 px-1">
                            {touched.description && errors.description ? (
                              <Text className="text-red-500 text-xs font-baloo">{errors.description}</Text>
                            ) : (
                              <View />
                            )}
                            <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} text-xs font-baloo`}>
                              {values.description.length}/100
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row gap-3">
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={closeCreateModal}
                            className="flex-1"
                          >
                            <View className={`${isNight ? 'bg-slate-700' : 'bg-slate-200'} py-3 h-12 rounded-xl items-center`}>
                              <Text className={`${isNight ? 'text-white' : 'text-slate-800'} font-baloo-semibold`}>
                                {t('common.cancel')}
                              </Text>
                            </View>
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleSubmit()}
                            className="flex-1"
                            disabled={createGroupMutation.isPending}
                          >
                            <View className="bg-blue-500 py-3 h-12 rounded-xl items-center">
                              {createGroupMutation.isPending ? (
                                <LottieView
                                  source={require('../../assets/animations/LoadingWhite.json')}
                                  autoPlay
                                  loop={true}
                                  style={{ width: 80, height: 80 }}
                                />
                              ) : (
                                <Text className="text-white font-baloo-semibold">
                                  {t('groups.create')}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </Formik>
                </PlatformBlur>
              </Animated.View>
            </Animated.View>
          )}

          {/* Modal de détails du groupe */}
          <GroupDetailsModal
            visible={showGroupModal}
            group={selectedGroup}
            onClose={handleCloseGroupModal}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}