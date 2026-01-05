import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StoryFolder from '~/components/StoryFolder';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { useStories } from '~/hooks/useStories';
import { useFavoriteStories } from '~/hooks/useFavoriteStories';

export default function StoriesScreen() {
  const navigation = useNavigation();
  const { isNight } = useTheme();

  // Utiliser les hooks TanStack Query pour récupérer les histoires et les favoris
  const { data: stories = [], isLoading: isLoadingStories, error: storiesError } = useStories();
  const { data: favoriteStories = [], isLoading: isLoadingFavorites } = useFavoriteStories();

  const animationRef = useRef(null);
  const translateX = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const skyColor = isNight ? '#020205' : '#87CEEB';
  const cloudColor = isNight ? '#A0AEC0' : '#FFFFFF';
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';

  const isLoading = isLoadingStories || isLoadingFavorites;
  const error = storiesError;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: skyColor }} >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className='text-white'>Chargement des histoires...</Text>
        <View
          className='absolute bottom-0 -right-20 border-4 h-36 rounded-t-full w-[100%] z-0'
          style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
        />
        <View
          className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-50'
          style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: skyColor }}>

          <Text className="text-white font-semibold">Ooops !</Text>
                    <Text className="text-white font-semibold">Une erreur est survenue</Text>

        <View
          className='absolute bottom-0 -right-20 border-4 h-36 rounded-t-full w-[100%] z-0'
          style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
        />
        <View
          className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-50'
          style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
        />
      </View>
    );
  }

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
        className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-50'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <Text className="text-4xl font-bold px-4">Mes histoires</Text>
      <Text className="color-slate-600 text-xl font-light mb-4 px-4">
        Toutes vos aventures vous attendent ici !
      </Text>
      <View className="flex flex-col gap-4 mb-4">
        <StoryFolder
          isNight={isNight}
          title="Tout"
          icon={<Feather name="list" size={24} color="#fff" />}
          storyType="ALL"
          description="Toutes vos histoires au même endroit"
          stories={stories}
        />
        <StoryFolder
          isNight={isNight}
          title="Récent"
          icon={<Feather name="clock" size={24} color="#fff" />}
          storyType="RECENT"
          description="Vos 10 histoires les plus récentes"
          stories={stories}
        />
        <StoryFolder
          isNight={isNight}
          title="Favorite"
          icon={<Feather name="heart" size={24} color="#fff" />}
          storyType="FAVORITE"
          description="Vos histoires préférées"
          stories={favoriteStories}
        />
      </View>
    </View>
  );
}
