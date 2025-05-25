import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, FlatList } from 'react-native';
import BottomNavBar from '~/navigation/BottomNavBar';
import { useNavigation } from '@react-navigation/native';

export default function StoriesScreen() {
  const navigation = useNavigation();

  // Simulation des stories de l'utilisateur
  const [stories, setStories] = useState([]);

  // Simule un fetch depuis un serveur ou une base locale
  useEffect(() => {
    // Simule un délai et une récupération de données
    const fetchStories = async () => {
      // Ex: remplacer ce tableau par un appel à ton backend
      const fetchedStories = []; // ou [{ id: 1, title: 'Ma story' }, ...]
      setStories(fetchedStories);
    };

    fetchStories();
  }, []);

  return (
    <View className="flex-1 bg-white pt-10 px-4">
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
          renderItem={({ item }) => (
            <View className="mb-2 p-4 bg-gray-100 rounded-lg">
              <Text className="text-lg font-medium">{item.title}</Text>
            </View>
          )}
        />
      )}

      <BottomNavBar />
    </View>
  );
}
