import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import StoryFolder from '~/components/StoryFolder';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { useUserStore, isPremiumUser } from '~/store/useUserStore';
import type { RootStackParamList, MainTabParamList } from '~/types';
import { useTranslation } from 'react-i18next';
import Background from '~/components/Background';
import { useFavoriteSharedStories } from '~/hooks/useFavoriteSharedStories';
import { useSharedStories } from '~/hooks/useSharedStories';

type SharedStoriesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'SharedStories'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function SharedStoriesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<SharedStoriesScreenNavigationProp>();
  const { isNight } = useTheme();
  const user = useUserStore((state) => state.user);
  const isPremium = isPremiumUser(user?.subscriptionPlan);
  const { data: sharedStories = [], isLoading: loading } = useSharedStories();
  const { data: favoriteStories = [], isLoading: loadingFavorites } = useFavoriteSharedStories();
  const [showBubble, setShowBubble] = useState(false);
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { bottom: bottomInset } = useSafeAreaInsets();
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
  }, []);


  return (
    <View className="flex-1 pt-10 relative"
      style={{ backgroundColor: skyColor }}>
      {/* 🌤️ Background animé */}
      <Background isNight={isNight} />
      <Animated.View
        style={{
          position: 'absolute',
          bottom: (isTablet ? 120 : 110) + bottomInset,
          right: isTablet ? 120 : 50,
        }}
      >
        <LottieView
          ref={animationRef}
          source={require('../../assets/animations/tree.json')}
          autoPlay
          loop={false}  
              style={{ width: isTablet ? 500 : 200, height: isTablet ? 500 : 200, zIndex: 5 }}
        />
      </Animated.View>
      {/* Sol */}
      <View
        className='absolute bottom-0 -right-20 border-4 h-36 rounded-tl-full w-[100%] z-10'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor, bottom: bottomInset }}
      />
        <Animated.View
          style={{
            position: 'absolute',
            bottom: (isTablet ? -25 : 65) + bottomInset,
            right: isTablet ? -40 : -15,
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
              style={{ width: isTablet ? 500 : 200, height: isTablet ? 500 : 200, zIndex: 5 }}
            />
          </TouchableOpacity>
        </Animated.View>
      <Text className={` ${isNight ? "text-white" : "text-black"} text-4xl md:text-5xl font-baloo-bold px-4 md:px-8 pt-4`}>{t('sharedStories.title')}</Text>
      {isPremium ? (
        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-xl md:text-2xl font-baloo mb-4 px-4 md:px-8`}>
          {t('sharedStories.premiumDescription')}
        </Text>
      ) : (
        <Text className={` ${isNight ? "text-white" : "text-slate-600"}  text-xl md:text-2xl font-baloo mb-4 px-4 md:px-8`}>
          {t('sharedStories.nonPremiumDescription')}
        </Text>
      )}
      <View className="flex-1 gap-4 pb-4">
        <StoryFolder
          isNight={isNight}
          isShared={true}
          isPremium={isPremium}
          title={t('sharedStories.allStories')}
          icon={<Feather name="share-2" size={24} color="#fff" />}
          storyType="ALL"
          description={t('sharedStories.allStoriesDesc')}
          stories={sharedStories}
          isLoading={loading}
        />
        <StoryFolder
          isNight={isNight}
          isShared={true}
          isPremium={isPremium}
          title={t('sharedStories.mostLiked')}
          icon={<Feather name="heart" size={24} color="#fff" />}
          storyType="RECENT"
          description={t('sharedStories.mostLikedDesc')}
          stories={favoriteStories}
          isLoading={loadingFavorites}
        />
        {showBubble && (
          <Animated.View
            className="absolute right-20 md:right-72 z-5"
            style={{ opacity: bubbleOpacity, bottom: (isTablet ? 320 : 240) + bottomInset }}
          >
            <View
              className="px-4 py-3 flex rounded-2xl bg-white text-black"
              style={{ width: isTablet ? 384 : width < 380 ? 256 : 320 }}
            >
              <Text className="font-baloo-medium text-base md:text-lg text-center">
                {t('sharedStories.storeBubble')}
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
    </View>
  );
}
