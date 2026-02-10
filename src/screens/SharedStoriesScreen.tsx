import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import StoryFolder from '~/components/StoryFolder';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { useUserStore, isPremiumUser } from '~/store/useUserStore';
import type { RootStackParamList, MainTabParamList } from '~/types';
import { useTranslation } from 'react-i18next';
import Background from '~/components/Background';

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
  const [sharedStories, setSharedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBubble, setShowBubble] = useState(false);
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const skyColor = isNight ? '#020205' : '#87CEEB';
  const groundColor = isNight ? '#2E313F' : '#38A169';
  const groundBorderColor = isNight ? '#44495D' : '#2F855A';

  const fetchSharedStories = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/story/shared`, {
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
      console.error('Erreur lors du chargement des histoires partagées:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchSharedStories();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show bubble after 2 seconds delay
  useEffect(() => {
    if (!isPremium) {
      const timer = setTimeout(() => {
        setShowBubble(true);
        Animated.timing(bubbleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isPremium]);


  return (
    <View className="flex-1 pt-10 relative"
      style={{ backgroundColor: skyColor }}>
      {/* 🌤️ Background animé */}
      <Background isNight={isNight} />
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
              style={{ width: isTablet ? 500 : 200, height: isTablet ? 500 : 200, zIndex: 5 }}
        />
      </Animated.View>
      {/* Sol */}
      <View
        className='absolute bottom-0 -right-20 border-4 h-36 rounded-t-full w-[100%] z-10'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      {!isPremium && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: isTablet ? -25 : 65,
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
      )}
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
          icon={<Feather name="clock" size={24} color="#fff" />}
          storyType="RECENT"
          description={t('sharedStories.mostLikedDesc')}
          stories={sharedStories}
          isLoading={loading}
        />
        {!isPremium && showBubble && (
          <Animated.View
            className="absolute bottom-60 md:bottom-80 right-20 md:right-72 z-10"
            style={{ opacity: bubbleOpacity }}
          >
            <View
              className="px-4 py-3 flex w-80 md:w-96 rounded-2xl bg-white text-black"
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
