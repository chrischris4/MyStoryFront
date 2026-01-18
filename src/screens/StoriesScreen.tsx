import React, { useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import StoryFolder from '~/components/StoryFolder';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { useStories } from '~/hooks/useStories';
import { useFavoriteStories } from '~/hooks/useFavoriteStories';
import StarryBackground from '~/components/StarryBackground';

export default function StoriesScreen() {
  const { isNight } = useTheme();
  const { data: stories = [], isLoading: isLoadingStories } = useStories();
  const { data: favoriteStories = [], isLoading: isLoadingFavorites } = useFavoriteStories();
  const animationRef = useRef(null);
  const skyColor = isNight ? '#020205' : '#87CEEB';
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';

  return (
    <View className="flex-1 pt-10 relative"
      style={{ backgroundColor: skyColor }}>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 110,
          right: 50,
        }}
      >
        <LottieView
          ref={animationRef}
          source={require('../../assets/animations/tree.json')}
          autoPlay
          loop={false}
          style={{ width: 200, height: 200 }}
        />
      </Animated.View>
      {isNight && <StarryBackground starCount={50} />}

      {/* Sol */}
      <View
        className='absolute bottom-0 -right-20 border-4 h-36 rounded-t-full w-[100%] z-0'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <View
        className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-50'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <Text className={`text-4xl font-baloo-bold px-4 pt-4 ${isNight ? "text-white" : "text-black"}`}>Mes histoires</Text>
      <Text className={` text-xl font-baloo mb-4 px-4 ${isNight ? "text-white" : "text-slate-600"}`}>
        Toutes vos aventures vous attendent ici !
      </Text>
      <View className="flex-1 gap-4">
        <StoryFolder
          isNight={isNight}
          title="Tout"
          icon={<Feather name="list" size={24} color="#fff" />}
          storyType="ALL"
          description="Toutes vos histoires au même endroit"
          stories={stories}
          isLoading={isLoadingStories}
        />
        <StoryFolder
          isNight={isNight}
          title="Récent"
          icon={<Feather name="clock" size={24} color="#fff" />}
          storyType="RECENT"
          description="Vos 10 histoires les plus récentes"
          stories={stories}
          isLoading={isLoadingStories}
        />
        <StoryFolder
          isNight={isNight}
          title="Favorite"
          icon={<Feather name="heart" size={24} color="#fff" />}
          storyType="FAVORITE"
          description="Vos histoires préférées"
          stories={favoriteStories}
          isLoading={isLoadingFavorites}
        />
      </View>
    </View>
  );
}
