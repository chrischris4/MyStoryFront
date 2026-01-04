import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Animated } from 'react-native';
import BottomNavBar from '~/navigation/BottomNavBar';
import { useNavigation } from '@react-navigation/native';
import StoryFolder from '~/components/StoryFolder';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';

export default function SharedStoriesScreen() {
  const navigation = useNavigation();
  const { isNight } = useTheme();

  const [sharedStories, setSharedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const animationRef = useRef(null);
  const translateX = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const skyColor = isNight ? '#020205' : '#87CEEB';
  const cloudColor = isNight ? '#A0AEC0' : '#FFFFFF';
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';

  const fetchSharedStories = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setError('Utilisateur non authentifié');
        return;
      }

      const response = await fetch('http://192.168.1.95:3000/story/shared', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des histoires partagées');
      }

      const data = await response.json();
      setSharedStories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchSharedStories();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: skyColor }} >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className='text-white'>Chargement des histoires partagées...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-red-500 mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-purple-700 px-4 py-2 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderStars = (count: number) => {
    const stars = [];
    const { width, height } = Dimensions.get('window');

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2 + 1;
      const top = Math.random() * (height * 0.5);
      const left = Math.random() * width;
      const opacity = Math.random() * 0.8 + 0.2;

      stars.push(
        <View
          key={`star-${i}`}
          style={{
            position: 'absolute',
            top,
            left,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#FFFFFF',
            opacity,
          }}
        />
      );
    }

    return stars;
  };

  return (
    <View className="flex-1 pt-10 relative"
      style={{ backgroundColor: skyColor }}>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          alignSelf: 'center',
        }}
      >
        <LottieView
          ref={animationRef}
          source={require('../../assets/animations/birds.json')}
          autoPlay
          loop={false}
          style={{ width: 700, height: 500 }}
        />
      </Animated.View>
      {isNight && renderStars(50)}

      {/* Sol */}
      <View
        className='absolute bottom-0 -right-20 border-4 h-36 rounded-t-full w-[100%] z-0'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <View
        className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-10'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <Text className="text-4xl font-bold px-4">Histoires partagées</Text>
      <Text className="color-slate-600 text-xl font-light mb-4 px-4">
        Découvrez les histoires partagées par la communauté !
      </Text>
      <View className="flex flex-col gap-4 mb-4">
        <StoryFolder
          title="Toutes les histoires partagées"
          icon={<Feather name="share-2" size={24} color="#fff" />}
          storyType="ALL"
          description="Toutes les histoires partagées par les utilisateurs"
          stories={sharedStories}
        />
        <StoryFolder
          title="Récentes"
          icon={<Feather name="clock" size={24} color="#fff" />}
          storyType="RECENT"
          description="Les 10 histoires partagées les plus récentes"
          stories={sharedStories}
        />
      </View>
      <BottomNavBar />
    </View>
  );
}
