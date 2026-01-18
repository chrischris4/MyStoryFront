import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

// Types pour les backgrounds
export type BackgroundType =
  | 'black'
  | 'starry-night'
  | 'ocean-waves'
  | 'forest-magic'
  | 'sunset-dream'
  | 'aurora';

interface BackgroundProps {
  width: number;
  height: number;
}

// Étoiles scintillantes
const Star = ({ delay, size, left, top }: { delay: number; size: number; left: number; top: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000 + Math.random() * 1000,
          delay,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#ffffff',
        opacity,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: size,
      }}
    />
  );
};

// Background ciel étoilé
export const StarryNightBackground = ({ width, height }: BackgroundProps) => {
  const stars = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: Math.random() * 2000,
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }))
  ).current;

  return (
    <View style={[styles.container, { width, height, backgroundColor: '#0a0a1a' }]}>
      {/* Gradient de fond */}
      <View style={[styles.gradient, { backgroundColor: '#0d1b2a', opacity: 0.5 }]} />
      <View style={[styles.gradientBottom, { backgroundColor: '#1b263b' }]} />

      {/* Étoiles */}
      {stars.map((star) => (
        <Star key={star.id} {...star} />
      ))}

      {/* Lune */}
      <View style={styles.moon} />
    </View>
  );
};

// Vague animée
const Wave = ({ delay, translateY, opacity: baseOpacity, color }: { delay: number; translateY: number; opacity: number; color: string }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          delay,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateYAnim = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, translateY],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: -50,
        right: -50,
        height: 200,
        backgroundColor: color,
        opacity: baseOpacity,
        borderTopLeftRadius: 1000,
        borderTopRightRadius: 1000,
        transform: [{ translateY: translateYAnim }],
      }}
    />
  );
};

// Background océan avec vagues
export const OceanWavesBackground = ({ width, height }: BackgroundProps) => {
  return (
    <View style={[styles.container, { width, height, backgroundColor: '#0c1445' }]}>
      {/* Étoiles subtiles */}
      {Array.from({ length: 20 }, (_, i) => (
        <Star
          key={i}
          delay={Math.random() * 2000}
          size={Math.random() * 2 + 0.5}
          left={Math.random() * 100}
          top={Math.random() * 40}
        />
      ))}

      {/* Vagues */}
      <Wave delay={0} translateY={-15} opacity={0.3} color="#1a3a5c" />
      <Wave delay={500} translateY={-10} opacity={0.4} color="#1e4d6b" />
      <Wave delay={1000} translateY={-8} opacity={0.5} color="#23617a" />
      <Wave delay={1500} translateY={-5} opacity={0.6} color="#287589" />
    </View>
  );
};

// Particule magique pour la forêt
const MagicParticle = ({ delay, startLeft, startTop }: { delay: number; startLeft: number; startTop: number }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1500,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 3000,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${startLeft}%`,
        top: `${startTop}%`,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#7fff00',
        opacity,
        transform: [{ translateY }],
        shadowColor: '#7fff00',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
      }}
    />
  );
};

// Background forêt magique
export const ForestMagicBackground = ({ width, height }: BackgroundProps) => {
  const particles = useRef(
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      delay: Math.random() * 3000,
      startLeft: Math.random() * 100,
      startTop: 50 + Math.random() * 50,
    }))
  ).current;

  return (
    <View style={[styles.container, { width, height, backgroundColor: '#0d1f0d' }]}>
      {/* Gradient forêt */}
      <View style={[styles.gradient, { backgroundColor: '#132513', opacity: 0.7 }]} />
      <View style={[styles.gradientBottom, { backgroundColor: '#0a1a0a', height: '50%' }]} />

      {/* Particules magiques */}
      {particles.map((particle) => (
        <MagicParticle key={particle.id} {...particle} />
      ))}

      {/* Lueur de fond */}
      <View style={styles.forestGlow} />
    </View>
  );
};

// Nuage pour sunset
const Cloud = ({ left, top, scale, opacity }: { left: number; top: number; scale: number; opacity: number }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 20,
          duration: 8000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: 80 * scale,
        height: 30 * scale,
        borderRadius: 20,
        backgroundColor: `rgba(255, 200, 150, ${opacity})`,
        transform: [{ translateX }, { scale }],
      }}
    />
  );
};

// Background coucher de soleil
export const SunsetDreamBackground = ({ width, height }: BackgroundProps) => {
  return (
    <View style={[styles.container, { width, height }]}>
      {/* Gradient sunset */}
      <View style={[styles.sunsetTop, { height: '40%' }]} />
      <View style={[styles.sunsetMiddle, { top: '40%', height: '30%' }]} />
      <View style={[styles.sunsetBottom, { top: '70%', height: '30%' }]} />

      {/* Soleil */}
      <View style={styles.sun} />

      {/* Nuages */}
      <Cloud left={10} top={15} scale={1} opacity={0.6} />
      <Cloud left={60} top={20} scale={0.8} opacity={0.5} />
      <Cloud left={30} top={35} scale={1.2} opacity={0.4} />
    </View>
  );
};

// Bande aurore
const AuroraBand = ({ delay, color, height: bandHeight, top }: { delay: number; color: string; height: number; top: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const scaleX = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 2000 + Math.random() * 1000,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleX, {
            toValue: 1.1,
            duration: 3000,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scaleX, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: -20,
        right: -20,
        top: `${top}%`,
        height: bandHeight,
        backgroundColor: color,
        opacity,
        transform: [{ scaleX }],
        borderRadius: 100,
      }}
    />
  );
};

// Background aurore boréale
export const AuroraBackground = ({ width, height }: BackgroundProps) => {
  return (
    <View style={[styles.container, { width, height, backgroundColor: '#0a0a20' }]}>
      {/* Étoiles */}
      {Array.from({ length: 30 }, (_, i) => (
        <Star
          key={i}
          delay={Math.random() * 2000}
          size={Math.random() * 2 + 0.5}
          left={Math.random() * 100}
          top={Math.random() * 100}
        />
      ))}

      {/* Bandes d'aurore */}
      <AuroraBand delay={0} color="#00ff88" height={60} top={20} />
      <AuroraBand delay={500} color="#00ffcc" height={40} top={30} />
      <AuroraBand delay={1000} color="#ff00ff" height={50} top={25} />
      <AuroraBand delay={1500} color="#00aaff" height={45} top={35} />
    </View>
  );
};

// Composant principal qui sélectionne le bon background
export const StoryBackground = ({ type, width, height }: { type: BackgroundType; width: number; height: number }) => {
  switch (type) {
    case 'starry-night':
      return <StarryNightBackground width={width} height={height} />;
    case 'ocean-waves':
      return <OceanWavesBackground width={width} height={height} />;
    case 'forest-magic':
      return <ForestMagicBackground width={width} height={height} />;
    case 'sunset-dream':
      return <SunsetDreamBackground width={width} height={height} />;
    case 'aurora':
      return <AuroraBackground width={width} height={height} />;
    case 'black':
    default:
      return <View style={[styles.container, { width, height, backgroundColor: 'black' }]} />;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  moon: {
    position: 'absolute',
    top: '10%',
    right: '15%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5dc',
    shadowColor: '#f5f5dc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  forestGlow: {
    position: 'absolute',
    bottom: '20%',
    left: '30%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(127, 255, 0, 0.1)',
    shadowColor: '#7fff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  sunsetTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a2e',
  },
  sunsetMiddle: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#ff6b6b',
  },
  sunsetBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#feca57',
  },
  sun: {
    position: 'absolute',
    top: '55%',
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff5e6',
    shadowColor: '#feca57',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
});

export default StoryBackground;
