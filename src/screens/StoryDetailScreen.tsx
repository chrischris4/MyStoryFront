import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Modal, FlatList, useWindowDimensions } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import BottomNavBar from '~/navigation/BottomNavBar';
import type { Story, RootStackParamList } from '~/types';
import { SafeAreaView } from 'react-native-safe-area-context';

type StoryDetailRouteProp = RouteProp<RootStackParamList, 'StoryDetail'>;

export default function StoryDetailScreen() {
  const route = useRoute<StoryDetailRouteProp>();
  const { storyId } = route.params;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`http://192.168.1.95:3000/story/detail/${storyId}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération de la story');
        const data: Story = await response.json();
        setStory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6b21a8" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (error || !story) {
    return (
      <View className="flex-1 items-center justify-center pb-20">
        <Text className="text-red-500">{error ?? 'Story non trouvée'}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-white px-4 pt-10">
        <Text className="text-2xl font-bold mb-4 text-center">{story.title}</Text>

        <TouchableOpacity
          onPress={() => setIsFullScreen(true)}
          className="bg-black px-3 py-2 rounded-xl mb-4"
        >
          <Text className="text-white font-medium">Plein écran</Text>
        </TouchableOpacity>

        {/* === MODAL FULLSCREEN === */}
        <Modal visible={isFullScreen} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <FlatList
              data={story.pages.sort((a, b) => a.pageIndex - b.pageIndex)}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={{
                  width,
                  height,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: isPortrait ? 16 : 32,
                }}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{
                      width: isPortrait ? width * 0.9 : height * 0.9,
                      height: isPortrait ? height * 0.6 : width * 0.6,
                      borderRadius: 16,
                    }}
                    resizeMode="contain"
                  />
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    marginTop: 20,
                    textAlign: 'center',
                    paddingHorizontal: 10,
                  }}>{item.text}</Text>
                </View>
              )}
            />

            <TouchableOpacity
              onPress={() => setIsFullScreen(false)}
              style={{
                position: 'absolute',
                top: 40,
                left: 20,
                backgroundColor: 'white',
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: 'black', fontWeight: '600' }}>Fermer</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

        {/* === PAGES CLASSIQUES === */}
        {story.pages
          .sort((a, b) => a.pageIndex - b.pageIndex)
          .map((page) => (
            <View key={page.id} className="mb-6 bg-gray-100 p-4 rounded-lg shadow">
              <Text className="mb-2 text-base">{page.text}</Text>
              <Image
                source={{ uri: page.imageUrl }}
                style={{ width: '100%', height: 200, borderRadius: 10 }}
                resizeMode="cover"
              />
            </View>
          ))}
      </ScrollView>
      <BottomNavBar />
    </>
  );
}
