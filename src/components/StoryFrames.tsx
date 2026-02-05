import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

// Types pour les cadres de couleur
export type FrameType =
  | 'none'
  | 'blue'
  | 'pink'
  | 'red'
  | 'black'
  | 'white'
  | 'yellow'
  | 'green'
  | 'purple'
  | 'gold'
  ;

// Types pour les effets animés
export type EffectType =
  | 'none'
  | 'stars'
  | 'fairy'
  | 'magic'
  | 'snow'
  | 'hearts'
  | 'bubbles'
  | 'fireflies'
  | 'confetti';

interface FrameProps {
  width: number;
  height: number;
}

// Étoile scintillante pour le cadre - version optimisée
const FrameStar = ({ delay, size, left, top }: { delay: number; size: number; left: number; top: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const duration = 1200 + delay * 0.5;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration,
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
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FFD700',
        opacity,
      }}
    />
  );
};

// Cadre étoiles - étoiles scintillantes autour des bords (optimisé)
export const StarsFrame = ({ width, height }: FrameProps) => {
  // Moins d'étoiles pour de meilleures performances
  const stars = useRef(
    Array.from({ length: 12 }, (_, i) => {
      const edge = i % 4;
      let left, top;

      switch (edge) {
        case 0: // top
          left = 10 + (i * 25) % 80;
          top = 2 + (i % 3) * 4;
          break;
        case 1: // right
          left = 92 + (i % 2) * 4;
          top = 10 + (i * 25) % 80;
          break;
        case 2: // bottom
          left = 10 + (i * 25) % 80;
          top = 92 + (i % 2) * 4;
          break;
        default: // left
          left = 2 + (i % 3) * 4;
          top = 10 + (i * 25) % 80;
      }

      return {
        id: i,
        delay: i * 200,
        size: 4 + (i % 3) * 2,
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


// Particule féerique dorée - version optimisée avec mouvement aléatoire
const FairyParticle = ({ delay, startLeft, startTop, moveY, duration }: {
  delay: number;
  startLeft: number;
  startTop: number;
  moveY: number;
  duration: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: moveY,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
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
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#FFD700',
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

// Cadre féerique - particules magiques dorées (optimisé avec positions aléatoires)
export const FairyFrame = ({ width, height }: FrameProps) => {
  const particles = useRef(
    Array.from({ length: 16 }, (_, i) => {
      const edge = Math.floor(Math.random() * 4);
      let left, top;

      switch (edge) {
        case 0: // bottom - particules montent
          left = 5 + Math.random() * 90;
          top = 85 + Math.random() * 12;
          break;
        case 1: // right
          left = 85 + Math.random() * 12;
          top = 5 + Math.random() * 90;
          break;
        case 2: // top
          left = 5 + Math.random() * 90;
          top = 3 + Math.random() * 12;
          break;
        default: // left
          left = 3 + Math.random() * 12;
          top = 5 + Math.random() * 90;
      }

      return {
        id: i,
        delay: Math.random() * 2500,
        startLeft: left,
        startTop: top,
        moveY: -15 - Math.random() * 20,
        duration: 1500 + Math.random() * 1000,
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

// ===== NOUVEAUX EFFETS =====

// Flocon de neige
const Snowflake = ({ delay, startLeft, duration, size }: {
  delay: number;
  startLeft: number;
  duration: number;
  size: number;
}) => {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 120,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
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
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FFFFFF',
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

// Cadre neige
export const SnowFrame = ({ width, height }: FrameProps) => {
  const snowflakes = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      delay: Math.random() * 3000,
      startLeft: 5 + Math.random() * 90,
      duration: 2500 + Math.random() * 1500,
      size: 3 + Math.random() * 4,
    }))
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {snowflakes.map((flake) => (
        <Snowflake key={flake.id} {...flake} />
      ))}
    </View>
  );
};

// Coeur flottant
const FloatingHeart = ({ delay, startLeft, startTop, moveY, duration }: {
  delay: number;
  startLeft: number;
  startTop: number;
  moveY: number;
  duration: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.9,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: moveY,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.5,
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
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    >
      <View style={{ width: 10, height: 10 }}>
        <View style={{
          position: 'absolute',
          top: 0,
          left: 2.5,
          width: 5,
          height: 8,
          backgroundColor: '#FF6B8A',
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          transform: [{ rotate: '-45deg' }],
        }} />
        <View style={{
          position: 'absolute',
          top: 0,
          left: 2.5,
          width: 5,
          height: 8,
          backgroundColor: '#FF6B8A',
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          transform: [{ rotate: '45deg' }],
        }} />
      </View>
    </Animated.View>
  );
};

// Cadre coeurs
export const HeartsFrame = ({ width, height }: FrameProps) => {
  const hearts = useRef(
    Array.from({ length: 12 }, (_, i) => {
      const edge = Math.floor(Math.random() * 4);
      let left, top;
      switch (edge) {
        case 0:
          left = 5 + Math.random() * 90;
          top = 88 + Math.random() * 10;
          break;
        case 1:
          left = 88 + Math.random() * 10;
          top = 5 + Math.random() * 90;
          break;
        case 2:
          left = 5 + Math.random() * 90;
          top = 2 + Math.random() * 10;
          break;
        default:
          left = 2 + Math.random() * 10;
          top = 5 + Math.random() * 90;
      }
      return {
        id: i,
        delay: Math.random() * 2500,
        startLeft: left,
        startTop: top,
        moveY: -20 - Math.random() * 15,
        duration: 1800 + Math.random() * 1000,
      };
    })
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {hearts.map((heart) => (
        <FloatingHeart key={heart.id} {...heart} />
      ))}
    </View>
  );
};

// Bulle
const Bubble = ({ delay, startLeft, startTop, size, duration }: {
  delay: number;
  startLeft: number;
  startTop: number;
  size: number;
  duration: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -40 - Math.random() * 20,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
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
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(135, 206, 250, 0.8)',
        backgroundColor: 'rgba(135, 206, 250, 0.2)',
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

// Cadre bulles
export const BubblesFrame = ({ width, height }: FrameProps) => {
  const bubbles = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      delay: Math.random() * 3000,
      startLeft: 5 + Math.random() * 90,
      startTop: 85 + Math.random() * 12,
      size: 8 + Math.random() * 10,
      duration: 2000 + Math.random() * 1500,
    }))
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {bubbles.map((bubble) => (
        <Bubble key={bubble.id} {...bubble} />
      ))}
    </View>
  );
};

// Luciole
const Firefly = ({ delay, left, top }: {
  delay: number;
  left: number;
  top: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(Math.random() * 1500),
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
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFEB3B',
        opacity,
      }}
    />
  );
};

// Cadre lucioles
export const FirefliesFrame = ({ width, height }: FrameProps) => {
  const fireflies = useRef(
    Array.from({ length: 16 }, (_, i) => {
      const edge = Math.floor(Math.random() * 4);
      let left, top;
      switch (edge) {
        case 0:
          left = 5 + Math.random() * 90;
          top = 2 + Math.random() * 12;
          break;
        case 1:
          left = 88 + Math.random() * 10;
          top = 5 + Math.random() * 90;
          break;
        case 2:
          left = 5 + Math.random() * 90;
          top = 88 + Math.random() * 10;
          break;
        default:
          left = 2 + Math.random() * 10;
          top = 5 + Math.random() * 90;
      }
      return { id: i, delay: Math.random() * 2000, left, top };
    })
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {fireflies.map((firefly) => (
        <Firefly key={firefly.id} {...firefly} />
      ))}
    </View>
  );
};

// Confetti
const ConfettiPiece = ({ delay, startLeft, color, duration }: {
  delay: number;
  startLeft: number;
  color: string;
  duration: number;
}) => {
  const translateY = useRef(new Animated.Value(-10)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 100,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -10,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
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

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${startLeft}%`,
        top: 0,
        width: 6,
        height: 10,
        backgroundColor: color,
        borderRadius: 1,
        opacity,
        transform: [{ translateY }, { rotate: spin }],
      }}
    />
  );
};

// Cadre confetti
export const ConfettiFrame = ({ width, height }: FrameProps) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];
  const confetti = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      delay: Math.random() * 2500,
      startLeft: 5 + Math.random() * 90,
      color: colors[i % colors.length],
      duration: 2000 + Math.random() * 1500,
    }))
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {confetti.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
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
    case 'white':
      return <ColorFrame width={width} height={height} color="#FFFFFF" />;
    case 'yellow':
      return <ColorFrame width={width} height={height} color="#F59E0B" />;
    case 'green':
      return <ColorFrame width={width} height={height} color="#10B981" />;
    case 'purple':
      return <ColorFrame width={width} height={height} color="#8B5CF6" />;
    case 'gold':
      return <ColorFrame width={width} height={height} color="#FFD700" />;
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
    case 'snow':
      return <SnowFrame width={width} height={height} />;
    case 'hearts':
      return <HeartsFrame width={width} height={height} />;
    case 'bubbles':
      return <BubblesFrame width={width} height={height} />;
    case 'fireflies':
      return <FirefliesFrame width={width} height={height} />;
    case 'confetti':
      return <ConfettiFrame width={width} height={height} />;
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
});

export default StoryFrame;
