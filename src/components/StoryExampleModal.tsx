import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

type StoryExampleModalProps = {
  visible: boolean;
  onClose: () => void;
};

const EXAMPLE_TITLE = 'Le Voyage de Luna et Félix';

const EXAMPLE_PROMPT =
  'Luna, une petite fille courageuse, et Félix, son chat magique, partent explorer une forêt enchantée où ils découvrent des créatures fantastiques et apprennent la valeur de l\'amitié.';

const EXAMPLE_STYLE = 'Classique';
const EXAMPLE_AGE = '4-5 ans';
const EXAMPLE_LANGUAGE = '🇫🇷 Français';

const EXAMPLE_CHARACTERS = [
  {
    name: 'Luna',
    emoji: '👧🏻',
    description: 'Fille, 5 ans, peau claire, cheveux blonds, yeux bleus',
  },
  {
    name: 'Félix',
    emoji: '🐱',
    description: 'Chat, jeune, pelage doré',
  },
];

const EXAMPLE_PAGES = [
  {
    page: 1,
    text: 'Il était une fois, dans un petit village au bord de la forêt, une petite fille nommée Luna qui vivait avec son chat magique Félix.',
    imageUrl: 'https://picsum.photos/seed/story1/800/500',
  },
  {
    page: 2,
    text: 'Un matin, Luna découvrit une carte mystérieuse dans le grenier. Elle montrait un chemin secret menant au cœur de la forêt enchantée.',
    imageUrl: 'https://picsum.photos/seed/story2/800/500',
  },
  {
    page: 3,
    text: '« Allons-y Félix ! » s\'exclama Luna en enfilant ses bottes d\'aventurière. Félix miaula joyeusement et ses moustaches se mirent à briller.',
    imageUrl: 'https://picsum.photos/seed/story3/800/500',
  },
  {
    page: 4,
    text: 'Ils traversèrent le vieux pont de pierre couvert de mousse. En dessous, la rivière chantait une mélodie douce et envoûtante.',
    imageUrl: 'https://picsum.photos/seed/story4/800/500',
  },
  {
    page: 5,
    text: 'Dans la forêt, les arbres étaient si grands que leurs cimes touchaient les nuages. Des lucioles dansaient entre les branches comme des étoiles tombées du ciel.',
    imageUrl: 'https://picsum.photos/seed/story5/800/500',
  },
  {
    page: 6,
    text: 'Soudain, ils rencontrèrent un petit lapin bleu qui pleurait. « J\'ai perdu mon chemin pour rentrer chez moi », sanglota-t-il.',
    imageUrl: 'https://picsum.photos/seed/story6/800/500',
  },
  {
    page: 7,
    text: '« Ne t\'inquiète pas, nous allons t\'aider ! » dit Luna. Félix renifla l\'air et ses moustaches magiques pointèrent vers le nord.',
    imageUrl: 'https://picsum.photos/seed/story7/800/500',
  },
  {
    page: 8,
    text: 'Ensemble, ils traversèrent un champ de fleurs géantes qui changeaient de couleur à chaque pas. Le lapin bleu retrouva le sourire.',
    imageUrl: 'https://picsum.photos/seed/story8/800/500',
  },
  {
    page: 9,
    text: 'Ils arrivèrent devant une cascade arc-en-ciel. Derrière elle se cachait une grotte scintillante remplie de cristaux lumineux.',
    imageUrl: 'https://picsum.photos/seed/story9/800/500',
  },
  {
    page: 10,
    text: 'Dans la grotte, une vieille tortue sage les accueillit. « Bienvenue, jeunes aventuriers. Le lapin habite juste de l\'autre côté de la colline aux champignons. »',
    imageUrl: 'https://picsum.photos/seed/story10/800/500',
  },
  {
    page: 11,
    text: 'Ils accompagnèrent le lapin bleu jusqu\'à sa maison, un terrier douillet décoré de petites lanternes. Sa famille les remercia chaleureusement.',
    imageUrl: 'https://picsum.photos/seed/story11/800/500',
  },
  {
    page: 12,
    text: 'Pour les remercier, le lapin offrit à Luna une fleur magique qui ne fane jamais, et à Félix une clochette qui tinte quand un ami a besoin d\'aide.',
    imageUrl: 'https://picsum.photos/seed/story12/800/500',
  },
  {
    page: 13,
    text: 'Luna et Félix rentrèrent chez eux sous un ciel étoilé, le cœur rempli de bonheur. Ils savaient que la forêt enchantée les attendrait pour de nouvelles aventures.',
    imageUrl: 'https://picsum.photos/seed/story13/800/500',
  },
];

export default function StoryExampleModal({ visible, onClose }: StoryExampleModalProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const imageWidth = (screenWidth - 48 - 12) / 2; // 2 columns, padding 24 each side, 12 gap
  const imageHeight = imageWidth * 0.625; // ~16:10

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
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="p-6">
              {/* Titre de l'histoire */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm font-baloo-semibold mb-1">
                  {t('storyExample.storyTitle', 'Titre de l\'histoire')}
                </Text>
                <View className="bg-gray-100 rounded-xl p-4">
                  <Text className="text-gray-800 text-lg font-baloo-bold">
                    {EXAMPLE_TITLE}
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
                    {EXAMPLE_PROMPT}
                  </Text>
                </View>
              </View>

              {/* Personnages */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm font-baloo-semibold mb-1">
                  {t('storyExample.characters', 'Personnages')}
                </Text>
                <View className="gap-2">
                  {EXAMPLE_CHARACTERS.map((character) => (
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
                      {EXAMPLE_STYLE}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm font-baloo-semibold mb-1">
                    {t('storyExample.ageGroup', 'Tranche d\'âge')}
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-4 items-center">
                    <Text className="text-gray-800 font-baloo-semibold">
                      {EXAMPLE_AGE}
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
                      {EXAMPLE_LANGUAGE}
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

              {/* Pages title */}
              <Text className="text-gray-800 text-xl font-baloo-bold mb-4">
                {t('storyExample.pagesTitle', 'Pages de l\'histoire')}
              </Text>

              {/* Pages grid - 2 columns */}
              <View className="flex flex-col">
                {EXAMPLE_PAGES.map((page) => (
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
                      <View className="p-3 bg-white/80 absolute bottom-2 max-w-[80%] self-center rounded-xl">
                        <Text className="text-black text-xs font-baloo" numberOfLines={3}>
                          {page.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Footer button */}
            <View className="px-6 mt-4">
              <TouchableOpacity
                className="bg-[#0D1821] px-6 py-4 rounded-xl items-center"
                onPress={onClose}
              >
                <Text className="text-white font-baloo-bold text-lg">
                  {t('storyExample.close', 'Fermer')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
