import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

// Types pour les cadres de couleur
export type FrameType =
  | 'none'
  | 'blue'
  | 'pink'
  | 'red'
  | 'black';

// Types pour les effets animés
export type EffectType =
  | 'none'
  | 'stars'
  | 'fairy'
  | 'magic';

interface FrameProps {
  width: number;
  height: number;
}

// Étoile scintillante pour le cadre
const FrameStar = ({ delay, size, left, top }: { delay: number; size: number; left: number; top: number }) => {
  const opacity = useRef(new Animated.Value(0.2)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800 + Math.random() * 800,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 800 + Math.random() * 800,
            delay,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.2,
            duration: 800 + Math.random() * 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 800 + Math.random() * 800,
            useNativeDriver: true,
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
        left: `${left}%`,
        top: `${top}%`,
        opacity,
        transform: [{ scale }],
      }}
    >
      <View style={{
        width: size,
        height: size,
        backgroundColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: size * 2,
      }}>
        {/* Forme d'étoile avec rotation */}
        <View style={{
          position: 'absolute',
          width: size,
          height: size * 0.3,
          backgroundColor: '#FFD700',
          top: size * 0.35,
        }} />
        <View style={{
          position: 'absolute',
          width: size * 0.3,
          height: size,
          backgroundColor: '#FFD700',
          left: size * 0.35,
        }} />
      </View>
    </Animated.View>
  );
};

// Cadre étoiles - étoiles scintillantes autour des bords
export const StarsFrame = ({ width, height }: FrameProps) => {
  // Générer des étoiles uniquement sur les bords (marge de 15%)
  const stars = useRef(
    Array.from({ length: 30 }, (_, i) => {
      const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let left, top;

      switch (edge) {
        case 0: // top
          left = Math.random() * 100;
          top = Math.random() * 12;
          break;
        case 1: // right
          left = 88 + Math.random() * 12;
          top = Math.random() * 100;
          break;
        case 2: // bottom
          left = Math.random() * 100;
          top = 88 + Math.random() * 12;
          break;
        default: // left
          left = Math.random() * 12;
          top = Math.random() * 100;
      }

      return {
        id: i,
        delay: Math.random() * 2000,
        size: Math.random() * 6 + 4,
        left,
        top,
      };
    })
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {stars.map((star) => (
        <FrameStar key={star.id} {...star} />
      ))}
    </View>
  );
};

// Cadre doré - bordure élégante
export const GoldenFrame = ({ width, height }: FrameProps) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const borderOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {/* Bordure dorée avec effet shimmer */}
      <Animated.View style={[styles.goldenBorder, { opacity: borderOpacity }]}>
        {/* Coins décoratifs */}
        <View style={[styles.goldenCorner, styles.topLeft]} />
        <View style={[styles.goldenCorner, styles.topRight]} />
        <View style={[styles.goldenCorner, styles.bottomLeft]} />
        <View style={[styles.goldenCorner, styles.bottomRight]} />
      </Animated.View>
    </View>
  );
};

// Particule féerique
const FairyParticle = ({ delay, startLeft, startTop }: { delay: number; startLeft: number; startTop: number }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -30 - Math.random() * 20,
            duration: 2500,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(translateX, {
            toValue: (Math.random() - 0.5) * 40,
            duration: 2500,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
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
        left: `${startLeft}%`,
        top: `${startTop}%`,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FF69B4',
        opacity,
        transform: [{ translateY }, { translateX }],
        shadowColor: '#FF69B4',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
      }}
    />
  );
};

// Cadre féerique - particules magiques
export const FairyFrame = ({ width, height }: FrameProps) => {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => {
      const edge = Math.floor(Math.random() * 4);
      let left, top;

      switch (edge) {
        case 0:
          left = Math.random() * 100;
          top = 85 + Math.random() * 15;
          break;
        case 1:
          left = 85 + Math.random() * 15;
          top = Math.random() * 100;
          break;
        case 2:
          left = Math.random() * 100;
          top = Math.random() * 15;
          break;
        default:
          left = Math.random() * 15;
          top = Math.random() * 100;
      }

      return {
        id: i,
        delay: Math.random() * 3000,
        startLeft: left,
        startTop: top,
      };
    })
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {particles.map((particle) => (
        <FairyParticle key={particle.id} {...particle} />
      ))}
    </View>
  );
};

// Cadre vintage - effet photo ancienne
export const VintageFrame = ({ width, height }: FrameProps) => {
  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {/* Vignette effect - coins assombris */}
      <View style={styles.vintageVignette} />

      {/* Bordure vintage */}
      <View style={styles.vintageBorder}>
        <View style={[styles.vintageCornerDecor, styles.topLeft]} />
        <View style={[styles.vintageCornerDecor, styles.topRight]} />
        <View style={[styles.vintageCornerDecor, styles.bottomLeft]} />
        <View style={[styles.vintageCornerDecor, styles.bottomRight]} />
      </View>
    </View>
  );
};

// Lueur magique animée
const MagicGlow = ({ position, color, delay }: { position: 'top' | 'bottom' | 'left' | 'right'; color: string; delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 1500,
          delay,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const positionStyles = {
    top: { top: 0, left: 0, right: 0, height: 60 },
    bottom: { bottom: 0, left: 0, right: 0, height: 60 },
    left: { top: 0, bottom: 0, left: 0, width: 60 },
    right: { top: 0, bottom: 0, right: 0, width: 60 },
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          ...positionStyles[position],
          opacity,
        },
      ]}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: color,
          opacity: 0.4,
          ...(position === 'top' || position === 'bottom'
            ? {
                shadowColor: color,
                shadowOffset: { width: 0, height: position === 'top' ? 20 : -20 },
                shadowOpacity: 1,
                shadowRadius: 30,
              }
            : {
                shadowColor: color,
                shadowOffset: { width: position === 'left' ? 20 : -20, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 30,
              }),
        }}
      />
    </Animated.View>
  );
};

// Cadre magique - lueurs colorées sur les bords
export const MagicFrame = ({ width, height }: FrameProps) => {
  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      <MagicGlow position="top" color="#9B59B6" delay={0} />
      <MagicGlow position="right" color="#3498DB" delay={500} />
      <MagicGlow position="bottom" color="#9B59B6" delay={1000} />
      <MagicGlow position="left" color="#3498DB" delay={1500} />
    </View>
  );
};

// Cadre de couleur simple
export const ColorFrame = ({ width, height, color }: FrameProps & { color: string }) => {
  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderWidth: 12,
          borderColor: color,
          borderRadius: 0,
        }}
      />
    </View>
  );
};

// Composant pour les cadres de couleur
export const StoryFrame = ({ type, width, height }: { type: FrameType; width: number; height: number }) => {
  switch (type) {
    case 'blue':
      return <ColorFrame width={width} height={height} color="#3B82F6" />;
    case 'pink':
      return <ColorFrame width={width} height={height} color="#EC4899" />;
    case 'red':
      return <ColorFrame width={width} height={height} color="#EF4444" />;
    case 'black':
      return <ColorFrame width={width} height={height} color="#000000" />;
    case 'none':
    default:
      return null;
  }
};

// Composant pour les effets animés
export const StoryEffect = ({ type, width, height }: { type: EffectType; width: number; height: number }) => {
  switch (type) {
    case 'stars':
      return <StarsFrame width={width} height={height} />;
    case 'fairy':
      return <FairyFrame width={width} height={height} />;
    case 'magic':
      return <MagicFrame width={width} height={height} />;
    case 'none':
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  frameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    zIndex: 5,
  },
  // Golden frame styles
  goldenBorder: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  goldenCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  topLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  // Vintage frame styles
  vintageVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 40,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 0,
  },
  vintageBorder: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(139, 90, 43, 0.6)',
  },
  vintageCornerDecor: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderColor: 'rgba(139, 90, 43, 0.8)',
    borderWidth: 2,
  },
});

export default StoryFrame;
