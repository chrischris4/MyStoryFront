import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEditProfil } from '~/hooks/useEditProfil';
import { useAuth } from '~/context/AuthContext';
import { useTheme } from '~/context/ThemeContext';
import Toast from 'react-native-toast-message';

type EditProfilModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function EditProfilModal({ visible, onClose }: EditProfilModalProps) {
  const { user } = useAuth();
  const { isNight } = useTheme();
  const { mutate: editProfil, isPending } = useEditProfil();

  const [name, setName] = useState(user?.profil?.name || '');
  const [imageUrl, setImageUrl] = useState(user?.profil?.imageUrl || '');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission requise', 'Vous devez autoriser l\'accès à vos photos pour changer votre image de profil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      // Ici vous devrez uploader l'image vers votre serveur et récupérer l'URL
      // Pour l'instant, on utilise l'URI local
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    const updates: { name?: string; imageUrl?: string } = {};

    if (name !== user?.profil?.name) {
      updates.name = name;
    }

    if (imageUrl !== user?.profil?.imageUrl) {
      updates.imageUrl = imageUrl;
    }

    if (Object.keys(updates).length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Aucune modification',
        text2: 'Vous n\'avez apporté aucune modification',
      });
      onClose();
      return;
    }

    editProfil(updates, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Profil modifié',
          text2: 'Votre profil a été mis à jour avec succès',
        });
        onClose();
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: error instanceof Error ? error.message : 'Une erreur est survenue',
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
              Modifier votre profil
            </Text>
            <Text className="text-white/70 text-sm font-baloo text-center mt-2">
              Personnalisez votre nom et photo de profil
            </Text>
          </View>

          {/* Content */}
          <View className="p-6">
            {/* Photo de profil */}
            <View className="items-center mb-6">
              <TouchableOpacity onPress={pickImage} className="relative">
                <Image
                  source={imageUrl ? { uri: imageUrl } : require('../../assets/default-avatar.png')}
                  className="w-24 h-24 rounded-full"
                  style={{ backgroundColor: '#E2E8F0' }}
                />
                <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                  <Feather name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text className={`${isNight ? 'text-white/70' : 'text-gray-500'} text-sm font-baloo mt-2`}>
                Appuyez pour changer votre photo
              </Text>
            </View>

            {/* Nom */}
            <View className="mb-4">
              <Text className={`${isNight ? 'text-white' : 'text-gray-500'} text-sm font-baloo-semibold mb-2`}>
                Nom d'affichage
              </Text>
              <TextInput
                className={`${isNight ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl p-4 text-lg font-baloo`}
                value={name}
                onChangeText={setName}
                placeholder="Entrez votre nom"
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
                {isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`${isNight ? 'bg-slate-700' : 'bg-gray-200'} px-6 py-4 rounded-xl items-center`}
              onPress={onClose}
              disabled={isPending}
            >
              <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
