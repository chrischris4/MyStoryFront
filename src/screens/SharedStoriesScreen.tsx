import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import StoryFolder from '~/components/StoryFolder';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { useUserStore } from '~/store/useUserStore';
import type { RootStackParamList, MainTabParamList } from '~/types';

type SharedStoriesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'SharedStories'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function SharedStoriesScreen() {
  const navigation = useNavigation<SharedStoriesScreenNavigationProp>();
  const { isNight } = useTheme();
  const user = useUserStore((state) => state.user);

  const [sharedStories, setSharedStories] = useState([]);
  const [loading, setLoading] = useState(true);

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
        className='absolute bottom-0 -right-20 border-4 h-36 rounded-t-full w-[100%] z-10'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      <View
        className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-30'
        style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
      />
      {!user?.isPremium && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 65,
            right: -15,
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
              style={{ width: 200, height: 200, zIndex: 5 }}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
      <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-4xl font-baloo-bold px-4 pt-4`}>Histoires partagées</Text>
      <Text className={` ${isNight ? "text-white/80" : "text-slate-600"}  text-xl font-baloo mb-4 px-4`}>
        Découvrez les histoires partagées par la communauté !
      </Text>
      <View className="flex flex-col gap-4 mb-4">
        <StoryFolder
          isNight={isNight}
          isShared={true}
          isPremium={user?.isPremium}
          title="Toutes les histoires"
          icon={<Feather name="share-2" size={24} color="#fff" />}
          storyType="ALL"
          description="Il y en a pour tout le monde !"
          stories={sharedStories}
          isLoading={loading}
        />
        <StoryFolder
          isNight={isNight}
          isShared={true}
          isPremium={user?.isPremium}
          title="Les plus apréciées"
          icon={<Feather name="clock" size={24} color="#fff" />}
          storyType="RECENT"
          description="Les 10 histoires les plus populaires"
          stories={sharedStories}
          isLoading={loading}
        />
      </View>
    </View>
  );
}
