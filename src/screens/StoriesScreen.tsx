import React, { useRef, useMemo, useEffect, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, useWindowDimensions } from 'react-native';
import StoryFolder from '~/components/StoryFolder';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { useStories } from '~/hooks/useStories';
import { useFavoriteStories } from '~/hooks/useFavoriteStories';
import { useTranslation } from 'react-i18next';
import Background from '~/components/Background';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '~/types';

type CreateStoryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'CreateStory'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function StoriesScreen() {
  const navigation = useNavigation<CreateStoryScreenNavigationProp>();

  const { t } = useTranslation();
  const { isNight } = useTheme();
  const { data: stories = [], isLoading: isLoadingStories } = useStories();
  const { data: favoriteStories = [], isLoading: isLoadingFavorites } = useFavoriteStories();
  const animationRef = useRef(null);
  const [showBubble, setShowBubble] = useState(false);
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const skyColor = isNight ? '#020205' : '#87CEEB';
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';

  // Show bubble after 2 seconds delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(true);
      Animated.timing(bubbleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 2000);

    return () => clearTimeout(timer);
  });

  return (
    <View className="flex-1 pt-10 relative"
      style={{ backgroundColor: skyColor }}>
      {/* 🌤️ Background animé */}
      <Background isNight={isNight} />
      <Animated.View
        style={{
          position: 'absolute',
          bottom: isTablet ? -25 : 65,
          right: isTablet ? -40 : -15,
          zIndex: 10 
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('BillingScreen')}
          activeOpacity={0.8}
        >
          <LottieView
            source={require('../../assets/animations/Store.json')}
            autoPlay
            loop={false}
            style={{ width: isTablet ? 500 : 200, height: isTablet ? 500 : 200}}
          />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: isTablet ? 120 : 110,
          right: isTablet ? 120 : 50,
        }}
      >
        <LottieView
          ref={animationRef}
          source={require('../../assets/animations/tree.json')}
          autoPlay
          loop={false}
          style={{ width: isTablet ? 500 : 200, height: isTablet ? 500 : 200 }}
        />
      </Animated.View>
      {/* Sol */}
      <View
        className='absolute bottom-0 -right-20 border-4 h-36 rounded-tl-full w-[100%] z-10'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <Text className={`text-4xl md:text-5xl font-baloo-bold px-4 md:px-8 pt-4 ${isNight ? "text-white" : "text-black"}`}>{t('stories.title')}</Text>
      <Text className={` text-xl md:text-2xl font-baloo mb-4 px-4 md:px-8 ${isNight ? "text-white" : "text-slate-600"}`}>
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
          title={t('stories.favorite')}
          icon={<Feather name="heart" size={24} color="#fff" />}
          storyType="FAVORITE"
          description={t('stories.favoriteDesc')}
          stories={favoriteStories}
          isLoading={isLoadingFavorites}
        />
      </View>
      {showBubble && (

        <Animated.View
          className="absolute bottom-60 md:bottom-80 right-20 md:right-72 z-10"
          style={{ opacity: bubbleOpacity }}
        >
          <View
            className="px-4 py-3 flex w-80 md:w-96 rounded-2xl bg-white text-black"
          >
            <Text className="font-baloo-medium text-base md:text-lg text-center">
              {t('sharedStories.storeBubble2')}
            </Text>
          </View>
          {/* Petite flèche de la bulle */}
          <View
            style={{
              position: 'absolute',
              bottom: -10,
              right: 20,
              width: 0,
              height: 0,
              borderLeftWidth: 10,
              borderRightWidth: 10,
              borderTopWidth: 12,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: 'white',
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}
