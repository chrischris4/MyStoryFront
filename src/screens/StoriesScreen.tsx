import React, { useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import StoryFolder from '~/components/StoryFolder';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { useStories } from '~/hooks/useStories';
import { useFavoriteStories } from '~/hooks/useFavoriteStories';
import { useTranslation } from 'react-i18next';
import Background from '~/components/Background';

export default function StoriesScreen() {
  const { t } = useTranslation();
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
      {/* 🌤️ Background animé */}
      <Background isNight={isNight} />
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
      {/* Sol */}
       <View
        className='absolute bottom-0 -right-20 border-4 h-36 rounded-t-full w-[100%] z-0'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <Text className={`text-4xl font-baloo-bold px-4 pt-4 ${isNight ? "text-white" : "text-black"}`}>{t('stories.title')}</Text>
      <Text className={` text-xl font-baloo mb-4 px-4 ${isNight ? "text-white" : "text-slate-600"}`}>
        {t('stories.subtitle')}
      </Text>
      <View className="flex-1 gap-4">
        <StoryFolder
          isNight={isNight}
          title={t('stories.all')}
          icon={<Feather name="list" size={24} color="#fff" />}
          storyType="ALL"
          description={t('stories.allDesc')}
          stories={stories}
          isLoading={isLoadingStories}
        />
        <StoryFolder
          isNight={isNight}
          title={t('stories.recent')}
          icon={<Feather name="clock" size={24} color="#fff" />}
          storyType="RECENT"
          description={t('stories.recentDesc')}
          stories={stories}
          isLoading={isLoadingStories}
        />
        <StoryFolder
          isNight={isNight}
          title={t('stories.favorite')}
          icon={<Feather name="heart" size={24} color="#fff" />}
          storyType="FAVORITE"
          description={t('stories.favoriteDesc')}
          stories={favoriteStories}
          isLoading={isLoadingFavorites}
        />
      </View>
    </View>
  );
}
