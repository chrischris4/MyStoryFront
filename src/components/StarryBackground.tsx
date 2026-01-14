import React, { useMemo } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

type StarryBackgroundProps = {
  starCount?: number;
  maxHeight?: number; // Hauteur max pour les étoiles (par défaut 50% de l'écran)
  animatedStyle?: { opacity: Animated.AnimatedInterpolation<number> }; // Pour l'opacité animée
};

type Star = {
  id: string;
  size: number;
  top: number;
  left: number;
  opacity: number;
};

export default function StarryBackground({
  starCount = 50,
  maxHeight,
  animatedStyle
}: StarryBackgroundProps) {
  const { width, height } = Dimensions.get('window');
  const effectiveMaxHeight = maxHeight ?? height * 0.5;

  // Générer les étoiles une seule fois
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: `star-${i}`,
      size: Math.random() * 2 + 1,
      top: Math.random() * effectiveMaxHeight,
      left: Math.random() * width,
      opacity: Math.random() * 0.8 + 0.2,
    }));
  }, [starCount, effectiveMaxHeight, width]);

  const starsContent = stars.map((star) => (
    <View
      key={star.id}
      style={{
        position: 'absolute',
        top: star.top,
        left: star.left,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: '#FFFFFF',
        opacity: star.opacity,
      }}
    />
  ));

  if (animatedStyle) {
    return (
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} pointerEvents="none">
        {starsContent}
      </Animated.View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {starsContent}
    </View>
  );
}
