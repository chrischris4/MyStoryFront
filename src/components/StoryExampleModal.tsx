import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import FullScreenStoryModal from './FullScreenStoryModal';

type StoryExampleModalProps = {
  visible: boolean;
  onClose: () => void;
};

const EXAMPLE_IMAGE_URLS = [
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/cover.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_1.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_2.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_3.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_4.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_5.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_6.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_7.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_8.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_9.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_10.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_11.webp',
  'https://pub-4440daff467b4f9da84a0416a4dc8269.r2.dev/story_82/page_12.webp',
];

export default function StoryExampleModal({ visible, onClose }: StoryExampleModalProps) {
  const { t } = useTranslation();
  const [showFullScreen, setShowFullScreen] = useState(false);

  const exampleTitle = t('storyExample.example.title');
  const examplePrompt = t('storyExample.example.prompt');
  const exampleCharacters = [
    { name: 'Mimi', emoji: '👧🏻', description: t('storyExample.example.characters.mimi') },
    { name: 'Anton', emoji: '🐶', description: t('storyExample.example.characters.anton') },
  ];
  const examplePages = [
    { page: 1, text: t('storyExample.example.pages.cover'), imageUrl: EXAMPLE_IMAGE_URLS[0] },
    { page: 2, text: t('storyExample.example.pages.page1'), imageUrl: EXAMPLE_IMAGE_URLS[1] },
    { page: 3, text: t('storyExample.example.pages.page2'), imageUrl: EXAMPLE_IMAGE_URLS[2] },
    { page: 4, text: t('storyExample.example.pages.page3'), imageUrl: EXAMPLE_IMAGE_URLS[3] },
    { page: 5, text: t('storyExample.example.pages.page4'), imageUrl: EXAMPLE_IMAGE_URLS[4] },
    { page: 6, text: t('storyExample.example.pages.page5'), imageUrl: EXAMPLE_IMAGE_URLS[5] },
    { page: 7, text: t('storyExample.example.pages.page6'), imageUrl: EXAMPLE_IMAGE_URLS[6] },
    { page: 8, text: t('storyExample.example.pages.page7'), imageUrl: EXAMPLE_IMAGE_URLS[7] },
    { page: 9, text: t('storyExample.example.pages.page8'), imageUrl: EXAMPLE_IMAGE_URLS[8] },
    { page: 10, text: t('storyExample.example.pages.page9'), imageUrl: EXAMPLE_IMAGE_URLS[9] },
    { page: 11, text: t('storyExample.example.pages.page10'), imageUrl: EXAMPLE_IMAGE_URLS[10] },
    { page: 12, text: t('storyExample.example.pages.page11'), imageUrl: EXAMPLE_IMAGE_URLS[11] },
    { page: 13, text: t('storyExample.example.pages.page12'), imageUrl: EXAMPLE_IMAGE_URLS[12] },
  ];
  const examplePagesAsPages = examplePages.map((p) => ({
    id: p.page,
    pageIndex: p.page - 1,
    text: p.text,
    imageUrl: p.imageUrl,
  }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50 px-4 py-[10%]">
        <View className="flex-1 w-full bg-white rounded-3xl overflow-hidden">
          {/* Header */}
          <View className="bg-[#0D1821] pt-6 pb-6 px-6">
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/20"
            >
              <Feather name="x" size={22} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-baloo-bold">
              {t('storyExample.title', 'Exemple d\'histoire')}
            </Text>
            <Text className="text-white/70 text-sm font-baloo mt-1">
              {t('storyExample.subtitle', 'Voici ce que vous pouvez obtenir en créant une histoire')}
            </Text>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            <View className="p-6 pb-0">
              {/* Titre de l'histoire */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm font-baloo-semibold mb-1">
                  {t('storyExample.storyTitle', 'Titre de l\'histoire')}
                </Text>
                <View className="bg-gray-100 rounded-xl p-4">
                  <Text className="text-gray-800 text-lg font-baloo-bold">
                    {exampleTitle}
                  </Text>
                </View>
              </View>

              {/* Prompt utilise */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm font-baloo-semibold mb-1">
                  {t('storyExample.promptUsed', 'Prompt utilisé')}
                </Text>
                <View className="bg-gray-100 rounded-xl p-4">
                  <Text className="text-gray-800 text-base font-baloo">
                    {examplePrompt}
                  </Text>
                </View>
              </View>

              {/* Personnages */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm font-baloo-semibold mb-1">
                  {t('storyExample.characters', 'Personnages')}
                </Text>
                <View className="gap-2">
                  {exampleCharacters.map((character) => (
                    <View key={character.name} className="bg-gray-100 rounded-xl p-4 flex-row items-center">
                      <Text className="text-2xl mr-3">{character.emoji}</Text>
                      <View className="flex-1">
                        <Text className="text-gray-800 font-baloo-semibold">
                          {character.name}
                        </Text>
                        <Text className="text-gray-600 text-sm font-baloo">
                          {character.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Style, Age*/}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm font-baloo-semibold mb-1">
                    {t('storyExample.style', 'Style')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 items-center">
                    <Text className="text-gray-800 font-baloo-semibold">
                      {t('storyExample.example.style')}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm font-baloo-semibold mb-1">
                    {t('storyExample.ageGroup', 'Tranche d\'âge')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 items-center">
                    <Text className="text-gray-800 font-baloo-semibold">
                      {t('storyExample.example.age')}
                    </Text>
                  </View>
                </View>

              </View>

              {/* Nombre de pages - langue*/}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm font-baloo-semibold mb-1">
                    {t('storyExample.language', 'Langue')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 items-center">
                    <Text className="text-gray-800 font-baloo-semibold">
                      {t('storyExample.example.language')}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm font-baloo-semibold mb-1">
                    {t('storyExample.numPages', 'Nombre de pages')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 items-center">
                    <Text className="text-gray-800 text-2xl font-baloo-bold">12</Text>
                  </View>
                </View>
              </View>

              {/* Separator */}
              <View className="h-px bg-gray-200 mb-6" />

              {/* Cover */}
              <Text className="text-gray-800 text-xl font-baloo-bold mb-2">
                {t('storyExample.coverTitle', 'Cover de l\'histoire')}
              </Text>
              <View className="rounded-xl overflow-hidden bg-gray-100 w-full mb-6">
                <Image
                  source={{ uri: EXAMPLE_IMAGE_URLS[0] }}
                  contentFit="cover"
                  style={{ width: '100%', aspectRatio: 16 / 10 }}
                />
                <View className="absolute top-2 self-center">
                  <View className="bg-white/80 px-3 py-1 rounded-xl mx-4">
                    <Text className="text-black font-baloo-bold text-lg text-center" numberOfLines={2}>
                      {exampleTitle}
                    </Text>
                  </View>
                </View>
                <View className="px-2 py-1 bg-white/80 absolute bottom-2 max-w-[80%] self-center rounded-xl">
                  <Text className="text-black text-[8px] font-baloo" numberOfLines={3}>
                    {examplePages[0].text}
                  </Text>
                </View>
              </View>

              {/* Pages title */}
              <Text className="text-gray-800 text-xl font-baloo-bold mb-2">
                {t('storyExample.pagesTitle', 'Pages de l\'histoire')}
              </Text>

              <View className="flex flex-col">
                {examplePages.slice(1).map((page) => (
                  <View
                    key={page.page}
                    className="mb-2 w-full"
                  >
                    <View className="rounded-xl overflow-hidden bg-gray-100 w-full">
                      <Image
                        source={{ uri: page.imageUrl }}
                        contentFit="cover"
                        style={{ width: '100%', aspectRatio: 16 / 10 }}
                      />
                      <View className="px-2 py-1 bg-white/80 absolute bottom-2 max-w-[80%] self-center rounded-xl">
                        <Text className="text-black text-[8px] font-baloo" numberOfLines={3}>
                          {page.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          {/* Footer buttons */}
          <View className="px-6 my-4 gap-3">
            <TouchableOpacity
              className="bg-[#0D1821] px-6 py-4 rounded-xl items-center flex-row justify-center gap-2"
              onPress={() => setShowFullScreen(true)}
            >
              <Feather name="maximize" size={18} color="white" />
              <Text className="text-white font-baloo-bold text-lg">
                {t('storyExample.readFullScreen', 'Lire en plein écran')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border border-gray-300 px-6 py-4 rounded-xl items-center"
              onPress={onClose}
            >
              <Text className="text-gray-700 font-baloo-bold text-lg">
                {t('storyExample.close', 'Fermer')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <FullScreenStoryModal
        visible={showFullScreen}
        pages={examplePagesAsPages.slice(1)}
        coverUrl={EXAMPLE_IMAGE_URLS[0]}
        title={exampleTitle}
        description={examplePrompt}
        isNight={false}
        onClose={() => setShowFullScreen(false)}
      />
    </Modal>
  );
}
