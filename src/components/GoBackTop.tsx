import { useState, useRef } from 'react';
import { TouchableOpacity, Animated, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface GoBackTopProps {
  scrollViewRef: React.RefObject<ScrollView | null>;
  showAfter?: number; // Position de scroll minimum pour afficher le bouton (défaut: 300)
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  isVisible: boolean;
  opacity: Animated.Value;
  scale: Animated.Value;
}

export default function GoBackTop({ scrollViewRef, isVisible, opacity, scale }: GoBackTopProps) {
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 100,
        right: 16,
        opacity,
        transform: [{ scale }],
        zIndex: 1000,
      }}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        onPress={scrollToTop}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        activeOpacity={0.8}
      >
        <BlurView
          intensity={80}
          tint="light"
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="arrow-up" size={28} />
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Hook personnalisé pour gérer le scroll
export const useGoBackTop = (showAfter = 300) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    if (offsetY > showAfter && !isVisible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (offsetY <= showAfter && isVisible) {
      setIsVisible(false);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return { handleScroll, isVisible, opacity, scale };
};
