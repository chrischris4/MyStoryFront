import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import BottomNavBar from '~/navigation/BottomNavBar';
import { useNavigation } from '@react-navigation/native';
import StoryFolder from '~/components/StoryFolder';
import { Feather } from '@expo/vector-icons';



export default function StoriesScreen() {
  const navigation = useNavigation();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


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
    <View className="flex-1 bg-blue-200 pt-10">
      <Text className="text-2xl font-bold px-4">Mes histoires</Text>
      <Text className=" color-slate-600 text-xl font-light mb-4 px-4">Toutes vos aventures vous attendent ici !</Text>
        <View className='flex flex-col gap-4 mb-4'>
          <StoryFolder
            title="Tout"
            icon={<Feather name="list" size={24} color="#fff" />}
            storyType="ALL"
            description='Toutes vos histoires au même endroit'
            stories={stories}
          />
          <StoryFolder
            title="Récent"
            icon={<Feather name="clock" size={24} color="#fff" />}
            storyType="RECENT"
            description='Vos 10 histoires les plus récentes'
            stories={stories}
          />
          <StoryFolder
            title="Favorite"
            icon={<Feather name="heart" size={24} color="#fff" />}
            storyType="FAVORITE"
            description='Vos histoires préférées'
            stories={stories}
          />
        </View>
      <BottomNavBar />
    </View>
  );
}
