import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  prompt: string;
  numPages: number;
  styleName: string;
  styleEmoji: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationModal({
  visible,
  title,
  prompt,
  numPages,
  styleName,
  styleEmoji,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-3xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <View className="bg-[#0D1821] p-6">
            <Text className="text-white text-2xl font-bold text-center">
              Confirmer la création
            </Text>
            <Text className="text-white/70 text-sm text-center mt-2">
              Vérifiez les informations avant de créer votre histoire
            </Text>
          </View>

          {/* Content */}
          <ScrollView className="max-h-96">
            <View className="p-6">
              {/* Titre */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm font-semibold mb-1">
                  Titre de l'histoire
                </Text>
                <View className="bg-gray-100 rounded-xl p-4">
                  <Text className="text-gray-800 text-lg font-semibold">
                    {title}
                  </Text>
                </View>
              </View>

              {/* Résumé */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm font-semibold mb-1">
                  Résumé
                </Text>
                <View className="bg-gray-100 rounded-xl p-4">
                  <Text className="text-gray-800 text-base">
                    {prompt}
                  </Text>
                </View>
              </View>

              {/* Style et Pages */}
              <View className="flex-row gap-3 mb-4">
                {/* Style */}
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm font-semibold mb-1">
                    Style
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 flex-row items-center">
                    <Text className="text-2xl mr-2">{styleEmoji}</Text>
                    <Text className="text-gray-800 font-semibold flex-1">
                      {styleName}
                    </Text>
                  </View>
                </View>

                {/* Nombre de pages */}
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm font-semibold mb-1">
                    Nombre de pages
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 items-center justify-center">
                    <Text className="text-gray-800 text-2xl font-bold">
                      {numPages}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Info coût */}
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-start">
                <Text className="text-blue-600 text-xl mr-3">ℹ️</Text>
                <View className="flex-1">
                  <Text className="text-blue-800 font-semibold mb-1">
                    Information importante
                  </Text>
                  <Text className="text-blue-700 text-sm">
                    Cette création utilisera 1 Story Coin. Une fois créée, l'histoire sera disponible dans votre bibliothèque.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="p-6 pt-0 gap-3">
            <TouchableOpacity
              className="bg-[#0D1821] px-6 py-4 rounded-xl items-center"
              onPress={onConfirm}
            >
              <Text className="text-white font-bold text-lg">
                Confirmer et créer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-200 px-6 py-4 rounded-xl items-center"
              onPress={onCancel}
            >
              <Text className="text-gray-800 font-semibold text-lg">
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
