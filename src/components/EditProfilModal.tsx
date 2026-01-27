import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEditProfil } from '~/hooks/useEditProfil';
import { useAuth } from '~/context/AuthContext';
import { useUserStore } from '~/store/useUserStore';
import { useTheme } from '~/context/ThemeContext';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

type EditProfilModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function EditProfilModal({ visible, onClose }: EditProfilModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isNight } = useTheme();
  const { mutate: editProfil, isPending } = useEditProfil();
  const updateProfile = useUserStore((state) => state.updateProfile);

  const [name, setName] = useState(user?.profil?.name || '');
  const [newImageUri, setNewImageUri] = useState<string | null>(null); // URI locale de la nouvelle image
  const currentImageUrl = user?.profil?.imageUrl || ''; // URL existante sur R2

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(t('profile.permissionRequired'), t('profile.photoPermissionMessage'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setNewImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    const updates: { name?: string; imageUri?: string } = {};

    if (name !== user?.profil?.name) {
      updates.name = name;
    }

    if (newImageUri) {
      updates.imageUri = newImageUri;
    }

    if (Object.keys(updates).length === 0) {
      Toast.show({
        type: 'info',
        text1: t('profile.noChanges'),
        text2: t('profile.noChangesMessage'),
      });
      onClose();
      return;
    }

    editProfil(updates, {
      onSuccess: (data) => {
        // Mettre à jour le store Zustand avec les données retournées par l'API
        updateProfile({
          name: data.name,
          imageUrl: data.imageUrl,
        });

        Toast.show({
          type: 'success',
          text1: t('profile.profileUpdated'),
          text2: t('profile.profileUpdatedMessage'),
        });
        onClose();
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: error instanceof Error ? error.message : t('errors.unknownError'),
        });
      },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className={`${isNight ? 'bg-slate-800' : 'bg-white'} rounded-3xl w-full max-w-lg overflow-hidden`}>
          {/* Header */}
          <View className={`${isNight ? 'bg-slate-900' : 'bg-[#0D1821]'} p-6`}>
            <Text className="text-white text-2xl font-baloo-bold text-center">
              {t('settings.editProfile')}
            </Text>
            <Text className="text-white/70 text-sm font-baloo text-center mt-2">
              {t('profile.customizeProfile')}
            </Text>
          </View>

          {/* Content */}
          <View className="p-6">
            {/* Photo de profil */}
            <View className="items-center mb-6">
              <TouchableOpacity onPress={pickImage} className="relative">
                <Image
                  source={newImageUri || currentImageUrl ? { uri: newImageUri || currentImageUrl } : require('../../assets/default-avatar.png')}
                  className="w-24 h-24 rounded-full"
                  style={{ backgroundColor: '#E2E8F0' }}
                />
                <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                  <Feather name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text className={`${isNight ? 'text-white/70' : 'text-gray-500'} text-sm font-baloo mt-2`}>
                {t('profile.tapToChangePhoto')}
              </Text>
            </View>

            {/* Nom */}
            <View className="mb-4">
              <Text className={`${isNight ? 'text-white' : 'text-gray-500'} text-sm font-baloo-semibold mb-2`}>
                {t('profile.displayName')}
              </Text>
              <TextInput
                className={`${isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl p-4 text-lg font-baloo`}
                value={name}
                onChangeText={setName}
                placeholder={t('profile.enterName')}
                placeholderTextColor={isNight ? '#94a3b8' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Actions */}
          <View className="p-6 pt-0 gap-3">
            <TouchableOpacity
              className={`${isNight ? 'bg-blue-600' : 'bg-[#0D1821]'} px-6 py-4 rounded-xl items-center ${isPending ? 'opacity-50' : ''}`}
              onPress={handleSave}
              disabled={isPending}
            >
              <Text className="text-white font-baloo-bold text-lg">
                {isPending ? t('common.loading') : t('common.save')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`${isNight ? 'bg-slate-700' : 'bg-gray-200'} px-6 py-4 rounded-xl items-center`}
              onPress={onClose}
              disabled={isPending}
            >
              <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
