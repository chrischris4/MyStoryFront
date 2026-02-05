import { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useSound } from '~/context/SoundContext';
import * as Haptics from 'expo-haptics';

export default function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width: screenWidth } = useWindowDimensions();
  const flowerTranslateY = useRef(new Animated.Value(50)).current;
  const flowerOpacity = useRef(new Animated.Value(0)).current;
  const flowerPosition = useRef(new Animated.Value(0)).current;

  // Hook pour les sons
  const { playSound } = useSound();

  // Tableau des boutons avec leur écran et icône
  const navItems = [
    { screen: 'Stories', icon: 'book' },
    { screen: 'SharedStories', icon: 'globe' },
    { screen: 'Home', icon: 'home' },
    { screen: 'CreateStory', icon: 'plus-circle' },
    { screen: 'SettingsScreen', icon: 'settings' },
  ];

  // Calculer la position horizontale de la fleur en fonction de l'écran actif
  useEffect(() => {
    const itemWidth = (screenWidth - 16) / navItems.length; // -16 pour les marges left-2 right-2
    const currentRoute = state.routes[state.index];
    const currentIndex = navItems.findIndex(item => item.screen === currentRoute.name);

    if (currentIndex !== -1) {
      const targetPosition = (currentIndex * itemWidth) + (itemWidth / 2) - 20;

      // Animation de la fleur qui apparaît
      Animated.parallel([
        Animated.spring(flowerPosition, {
          toValue: targetPosition,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
        Animated.timing(flowerTranslateY, {
          toValue: -40,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(flowerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.index]);

  return (
    <View className="absolute bottom-2 left-2 right-2 h-16 flex flex-row justify-around items-center rounded-xl shadow-md z-50">
      {/* Fleur indicatrice qui suit la page active */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          transform: [
            { translateX: flowerPosition },
            { translateY: flowerTranslateY },
          ],
          opacity: flowerOpacity,
          zIndex: 100,
        }}
      >
        <LottieView
          source={require('../../assets/animations/FlowerDance.json')}
          autoPlay
          loop={true}
          style={{ width: 40, height: 40 }}
        />
      </Animated.View>

      {navItems.map((item, index) => {
        const route = state.routes.find(r => r.name === item.screen);
        if (!route) return null;

        const isActive = state.index === state.routes.indexOf(route);

        return (
          <TouchableOpacity
            key={item.screen}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              playSound('pop');
              navigation.navigate(item.screen);
            }}
            className="items-center"
          >
            <View className={` ${isActive ? "bg-yellow-800" : ""} h-16 w-16 rounded-full flex items-center justify-center`}>
              <Feather
                name={item.icon as keyof typeof Feather.glyphMap}
                size={item.screen === 'CreateStory' ? 26 : 24}
                color={isActive ? '#FFFFFF' : '#E6F9F8'}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
