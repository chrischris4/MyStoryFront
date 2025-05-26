import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import BottomNavBar from '~/navigation/BottomNavBar';
import { useNavigation } from '@react-navigation/native';


export default function StoriesScreen() {
  const navigation = useNavigation();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ProfilId en dur pour test
  const profilId = 3;

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch(`http://192.168.1.95:3000/story/${profilId}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des histoires');
        }
        const data = await response.json();
        setStories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6b21a8" />
        <Text>Chargement des histoires...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-red-500 mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-purple-700 px-4 py-2 rounded-lg"
          onPress={() => navigation.navigate('CreateStory')}
        >
          <Text className="text-white font-semibold">Créer une Story</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-200 pt-10 px-4 pb-16">
      <Text className="text-xl font-bold mb-4 text-center">Mes histoires</Text>

      {stories.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 mb-4">Pas d'histoires créées.</Text>
          <TouchableOpacity
            className="bg-purple-700 px-4 py-2 rounded-lg"
            onPress={() => navigation.navigate('CreateStory')}
          >
            <Text className="text-white font-semibold">Créer une Story</Text>
          </TouchableOpacity>
        </View>
      ) : (

        <FlatList
          data={stories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const firstPageImage = item.pages?.[0]?.imageUrl;

            return (
              <TouchableOpacity
                className="mb-2 p-4 bg-gray-100 rounded-lg"
                onPress={() => navigation.navigate('StoryDetail', { storyId: item.id })}
              >
                <Text className="text-lg font-medium mb-2">{item.title}</Text>

                {firstPageImage && (
                  <Image
                    source={{ uri: firstPageImage }}
                    style={{ width: '100%', height: 150, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />

      )}

      <BottomNavBar />
    </View>
  );
}
