import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Animated } from 'react-native';
import BottomNavBar from '~/navigation/BottomNavBar';
import { useNavigation } from '@react-navigation/native';
import StoryFolder from '~/components/StoryFolder';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';

export default function StoriesScreen() {
  const navigation = useNavigation();
  const { isNight } = useTheme();

  const [stories, setStories] = useState([]);
  const [favoriteStories, setFavoriteStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const animationRef = useRef(null);
  const translateX = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  // useEffect(() => {
  //   animationRef.current?.play();

  //   Animated.timing(translateX, {
  //     toValue: -300,
  //     duration: 5000,
  //     useNativeDriver: true,
  //   }).start();
  // }, []);

  const fetchStories = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setError('Utilisateur non authentifié');
        return;
      }

      const response = await fetch('http://192.168.1.95:3000/story', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des histoires');
      }

      const data = await response.json();
      setStories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchFavoriteStories = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Utilisateur non connecté');
      }

      const response = await fetch('http://192.168.1.95:3000/favorite-story/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des histoires favorites');
      }

      const data = await response.json();
      setFavoriteStories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await fetchStories();
        await fetchFavoriteStories();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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

  const skyColor = isNight ? '#020205' : '#87CEEB';
  const cloudColor = isNight ? '#A0AEC0' : '#FFFFFF';
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';



  const renderStars = (count: number) => {
    const stars = [];
    const { width, height } = Dimensions.get('window');

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2 + 1; // taille entre 1 et 3
      const top = Math.random() * (height * 0.5); // moitié supérieure de l'écran
      const left = Math.random() * width;
      const opacity = Math.random() * 0.8 + 0.2; // variation d'opacité

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
          // transform: [{ translateX }],
          position: 'absolute',
          bottom: 0,
          right:0,
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
      <Text className="text-4xl font-bold px-4">Mes histoires</Text>
      <Text className="color-slate-600 text-xl font-light mb-4 px-4">
        Toutes vos aventures vous attendent ici !
      </Text>
      <View className="flex flex-col gap-4 mb-4">
        <StoryFolder
          title="Tout"
          icon={<Feather name="list" size={24} color="#fff" />}
          storyType="ALL"
          description="Toutes vos histoires au même endroit"
          stories={stories}
        />
        <StoryFolder
          title="Récent"
          icon={<Feather name="clock" size={24} color="#fff" />}
          storyType="RECENT"
          description="Vos 10 histoires les plus récentes"
          stories={stories}
        />
        <StoryFolder
          title="Favorite"
          icon={<Feather name="heart" size={24} color="#fff" />}
          storyType="FAVORITE"
          description="Vos histoires préférées"
          stories={favoriteStories}
        />
      </View>
      <BottomNavBar />
    </View>
  );
}
