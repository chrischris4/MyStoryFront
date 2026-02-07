import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, Easing } from 'react-native-reanimated';

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
  | 'gold';

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


// ===== STARS - Icones etoiles scintillantes =====

const TwinkleStar = ({ stagger, size, left, top, color }: {
  stagger: number; size: number; left: number; top: number; color: string;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const duration = 900 + Math.random() * 800;
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1.2, duration, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0.15, duration, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.6, duration, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, stagger);

    return () => {
      clearTimeout(timer);
      opacity.stopAnimation();
      scale.stopAnimation();
    };
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
      <Feather name="star" size={size} color={color} />
    </Animated.View>
  );
};

export const StarsFrame = ({ width, height }: FrameProps) => {
  const colors = ['#FFFFFF', '#FEF9C3', '#FDE68A', '#FCD34D', '#E0E7FF', '#DBEAFE'];
  const stars = useRef(
    Array.from({ length: 26 }, (_, i) => {
      const edge = i % 4;
      let left: number, top: number;
      switch (edge) {
        case 0: left = 2 + Math.random() * 96; top = 1 + Math.random() * 10; break;
        case 1: left = 88 + Math.random() * 10; top = 5 + Math.random() * 90; break;
        case 2: left = 2 + Math.random() * 96; top = 88 + Math.random() * 10; break;
        default: left = 1 + Math.random() * 10; top = 5 + Math.random() * 90;
      }
      return { id: i, stagger: Math.random() * 3000, size: 10 + Math.floor(Math.random() * 14), left, top, color: colors[i % colors.length] };
    })
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {stars.map((s) => <TwinkleStar key={s.id} {...s} />)}
    </View>
  );
};


// ===== FAIRY - Particules dorees (recursive) + etincelles =====

const FairyParticle = ({ stagger, startLeft, startTop, moveY, duration, size, color }: {
  stagger: number; startLeft: number; startTop: number; moveY: number; duration: number; size: number; color: string;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.2)).current;
  const alive = useRef(true);

  useEffect(() => {
    const rest = 800 + Math.random() * 500;

    const runCycle = () => {
      if (!alive.current) return;
      translateY.setValue(0);
      scaleAnim.setValue(0.2);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: moveY, duration, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        ]),
        Animated.delay(rest),
      ]).start(({ finished }) => { if (finished) runCycle(); });
    };

    const timer = setTimeout(runCycle, stagger);
    return () => { alive.current = false; clearTimeout(timer); opacity.stopAnimation(); translateY.stopAnimation(); scaleAnim.stopAnimation(); };
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', left: `${startLeft}%`, top: `${startTop}%`, alignItems: 'center', justifyContent: 'center', opacity, transform: [{ translateY }, { scale: scaleAnim }] }}>
      <View style={{ position: 'absolute', width: size * 3.5, height: size * 3.5, borderRadius: size * 1.75, backgroundColor: color, opacity: 0.2 }} />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </Animated.View>
  );
};

const FairySparkle = ({ stagger, left, top, size, color }: {
  stagger: number; left: number; top: number; size: number; color: string;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const alive = useRef(true);

  useEffect(() => {
    const runCycle = () => {
      if (!alive.current) return;
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.delay(200 + Math.random() * 600),
      ]).start(({ finished }) => { if (finished) runCycle(); });
    };

    const timer = setTimeout(runCycle, stagger);
    return () => { alive.current = false; clearTimeout(timer); opacity.stopAnimation(); };
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity }} />
  );
};

export const FairyFrame = ({ width, height }: FrameProps) => {
  const particles = useRef(
    Array.from({ length: 28 }, (_, i) => {
      const edge = Math.floor(Math.random() * 4);
      let left: number, top: number;
      switch (edge) {
        case 0: left = 5 + Math.random() * 90; top = 80 + Math.random() * 15; break;
        case 1: left = 85 + Math.random() * 12; top = 5 + Math.random() * 90; break;
        case 2: left = 5 + Math.random() * 90; top = 3 + Math.random() * 15; break;
        default: left = 3 + Math.random() * 12; top = 5 + Math.random() * 90;
      }
      const colors = ['#FFD700', '#FFC107', '#FFFFFF', '#FFE082'];
      return { id: i, stagger: Math.random() * 2500, startLeft: left, startTop: top, moveY: -20 - Math.random() * 25, duration: 2200 + Math.random() * 1500, size: 4 + Math.random() * 4, color: colors[i % colors.length] };
    })
  ).current;

  const sparkles = useRef(
    Array.from({ length: 22 }, (_, i) => {
      const edge = Math.floor(Math.random() * 4);
      let left: number, top: number;
      switch (edge) {
        case 0: left = 3 + Math.random() * 94; top = 2 + Math.random() * 10; break;
        case 1: left = 90 + Math.random() * 8; top = 5 + Math.random() * 90; break;
        case 2: left = 3 + Math.random() * 94; top = 88 + Math.random() * 10; break;
        default: left = 2 + Math.random() * 8; top = 5 + Math.random() * 90;
      }
      const colors = ['#FFD700', '#FFF8DC', '#FFFACD'];
      return { id: i, stagger: Math.random() * 2000, left, top, size: 2 + Math.random() * 2, color: colors[i % colors.length] };
    })
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {particles.map((p) => <FairyParticle key={p.id} {...p} />)}
      {sparkles.map((s) => <FairySparkle key={`s-${s.id}`} {...s} />)}
    </View>
  );
};


// ===== MAGIC - Lueurs + sparkles =====

const MagicGlow = ({ position, color, stagger }: { position: 'top' | 'bottom' | 'left' | 'right'; color: string; stagger: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.9, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(opacity, { toValue: 0.3, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();
    }, stagger);
    return () => { clearTimeout(timer); opacity.stopAnimation(); };
  }, []);

  const pos = {
    top: { top: 0, left: 0, right: 0, height: 70 },
    bottom: { bottom: 0, left: 0, right: 0, height: 70 },
    left: { top: 0, bottom: 0, left: 0, width: 70 },
    right: { top: 0, bottom: 0, right: 0, width: 70 },
  };

  return (
    <Animated.View style={{ position: 'absolute', ...pos[position], opacity }}>
      <View style={{
        flex: 1, backgroundColor: color, opacity: 0.5,
        ...(position === 'top' || position === 'bottom'
          ? { shadowColor: color, shadowOffset: { width: 0, height: position === 'top' ? 25 : -25 }, shadowOpacity: 1, shadowRadius: 35 }
          : { shadowColor: color, shadowOffset: { width: position === 'left' ? 25 : -25, height: 0 }, shadowOpacity: 1, shadowRadius: 35 }),
      }} />
    </Animated.View>
  );
};

const MagicSparkle = ({ stagger, left, top, color }: {
  stagger: number; left: number; top: number; color: string;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const alive = useRef(true);

  useEffect(() => {
    const runCycle = () => {
      if (!alive.current) return;
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]),
        Animated.delay(300 + Math.random() * 800),
      ]).start(({ finished }) => { if (finished) runCycle(); });
    };

    const timer = setTimeout(runCycle, stagger);
    return () => { alive.current = false; clearTimeout(timer); opacity.stopAnimation(); scale.stopAnimation(); };
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: `${left}%`, top: `${top}%`, width: 5, height: 5, borderRadius: 2.5,
      backgroundColor: color, opacity, transform: [{ scale }],
      shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6,
    }} />
  );
};

export const MagicFrame = ({ width, height }: FrameProps) => {
  const sparkles = useRef(
    Array.from({ length: 32 }, (_, i) => ({
      id: i, stagger: Math.random() * 3000,
      left: 10 + Math.random() * 80, top: 10 + Math.random() * 80,
      color: i % 3 === 0 ? '#C084FC' : i % 3 === 1 ? '#60A5FA' : '#F0ABFC',
    }))
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      <MagicGlow position="top" color="#9B59B6" stagger={0} />
      <MagicGlow position="right" color="#3498DB" stagger={500} />
      <MagicGlow position="bottom" color="#9B59B6" stagger={1000} />
      <MagicGlow position="left" color="#3498DB" stagger={1500} />
      {sparkles.map((s) => <MagicSparkle key={s.id} {...s} />)}
    </View>
  );
};


// ===== SNOW - Flocons lents (recursive, zero flash) =====

const Snowflake = ({ stagger, startLeft, duration, size }: {
  stagger: number; startLeft: number; duration: number; size: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const alive = useRef(true);

  useEffect(() => {
    const rest = 800 + Math.random() * 500;
    const swayAmount = 12 + Math.random() * 15;
    const swayDuration = 1200 + Math.random() * 600;

    const runCycle = () => {
      if (!alive.current) return;
      translateY.setValue(-10);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.85, duration: 500, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 160, duration, useNativeDriver: true, easing: Easing.linear }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.delay(rest),
      ]).start(({ finished }) => { if (finished) runCycle(); });
    };

    const timer = setTimeout(runCycle, stagger);

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, { toValue: swayAmount, duration: swayDuration, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(translateX, { toValue: -swayAmount, duration: swayDuration, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    return () => { alive.current = false; clearTimeout(timer); opacity.stopAnimation(); translateY.stopAnimation(); translateX.stopAnimation(); };
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: `${startLeft}%`, top: 0,
      width: size, height: size, borderRadius: size / 2, backgroundColor: '#FFFFFF',
      opacity, transform: [{ translateY }, { translateX }],
    }} />
  );
};

export const SnowFrame = ({ width, height }: FrameProps) => {
  const snowflakes = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      id: i, stagger: Math.random() * 4000,
      startLeft: 2 + Math.random() * 96,
      duration: 4000 + Math.random() * 3000,
      size: 2 + Math.random() * 6,
    }))
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {snowflakes.map((f) => <Snowflake key={f.id} {...f} />)}
    </View>
  );
};



type FloatingHeartProps = {
  stagger: number;
  startLeft: number;
  startTop: number;
  moveY: number;
  duration: number;
  size: number;
  color: string;
};

export const FloatingHeart = ({
  stagger,
  startLeft,
  startTop,
  moveY,
  duration,
  size,
  color,
}: FloatingHeartProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.4);

  useEffect(() => {
    const rest = 700 + Math.random() * 600;
    const swayAmount = 6 + Math.random() * 10;
    const swayDuration = 900 + Math.random() * 700;

    // 🌊 sway horizontal (loop infini, UI thread)
    translateX.value = withRepeat(
      withSequence(
        withTiming(swayAmount, {
          duration: swayDuration,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-swayAmount, {
          duration: swayDuration,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    // ❤️ cycle principal
    opacity.value = withDelay(
      stagger,
      withRepeat(
        withSequence(
          // reset invisible
          withTiming(0, { duration: 0 }),
          withTiming(0.95, { duration: 350 }),
          withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) }),
          withTiming(0, { duration: rest })
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      stagger,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 0 }),
          withSpring(1, { damping: 8, stiffness: 120 }),
          withTiming(0.4, { duration: 500 }),
          withTiming(0.4, { duration: rest })
        ),
        -1,
        false
      )
    );

    translateY.value = withDelay(
      stagger,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(moveY, {
            duration,
            easing: Easing.out(Easing.cubic),
          }),
          withTiming(0, { duration: 0 }),
          withTiming(0, { duration: rest })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.heart,
        {
          left: `${startLeft}%`,
          top: `${startTop}%`,
        },
        animatedStyle,
      ]}
    >
      <Ionicons name="heart" size={size} color={color} />
    </Animated.View>
  );
};

type FrameProps = {
  width: number;
  height: number;
};

export const HeartsFrame = ({ width, height }: FrameProps) => {
  const colors = [
    '#FF6B8A',
    '#FF4D6D',
    '#FF85A1',
    '#FF2D55',
    '#FF7EB3',
    '#C9184A',
  ];

  const hearts = Array.from({ length: 20 }, (_, i) => {
    const edge = Math.floor(Math.random() * 4);
    let left: number, top: number;

    switch (edge) {
      case 0:
        left = 5 + Math.random() * 90;
        top = 82 + Math.random() * 15;
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
      stagger: Math.random() * 3000,
      startLeft: left,
      startTop: top,
      moveY: -25 - Math.random() * 25,
      duration: 2200 + Math.random() * 1600,
      size: 14 + Math.floor(Math.random() * 10),
      color: colors[i % colors.length],
    };
  });

  return (
    <View pointerEvents="none" style={[styles.frame, { width, height }]}>
      {hearts.map((h) => (
        <FloatingHeart key={h.id} {...h} />
      ))}
    </View>
  );
};



// ===== BUBBLES - Bulles (recursive, zero flash) =====

const Bubble = ({ stagger, startLeft, startTop, size, duration }: {
  stagger: number; startLeft: number; startTop: number; size: number; duration: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const alive = useRef(true);

  useEffect(() => {
    const rest = 800 + Math.random() * 500;
    const riseDistance = -55 - Math.random() * 25;
    const driftAmount = 10 + Math.random() * 15;
    const driftDuration = 1200 + Math.random() * 800;

    const runCycle = () => {
      if (!alive.current) return;
      translateY.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.7, duration: 500, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: riseDistance, duration, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.delay(rest),
      ]).start(({ finished }) => { if (finished) runCycle(); });
    };

    const timer = setTimeout(runCycle, stagger);

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, { toValue: driftAmount, duration: driftDuration, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(translateX, { toValue: -driftAmount, duration: driftDuration, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    return () => { alive.current = false; clearTimeout(timer); opacity.stopAnimation(); translateY.stopAnimation(); translateX.stopAnimation(); };
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: `${startLeft}%`, top: `${startTop}%`,
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 1.5, borderColor: 'rgba(135, 206, 250, 0.7)', backgroundColor: 'rgba(135, 206, 250, 0.1)',
      opacity, transform: [{ translateY }, { translateX }],
    }}>
      <View style={{
        position: 'absolute', top: size * 0.15, left: size * 0.2,
        width: size * 0.3, height: size * 0.2, borderRadius: size * 0.15,
        backgroundColor: 'rgba(255, 255, 255, 0.6)', transform: [{ rotate: '-30deg' }],
      }} />
    </Animated.View>
  );
};

export const BubblesFrame = ({ width, height }: FrameProps) => {
  const bubbles = useRef(
    Array.from({ length: 24 }, (_, i) => ({
      id: i, stagger: Math.random() * 3500,
      startLeft: 3 + Math.random() * 94, startTop: 78 + Math.random() * 19,
      size: 8 + Math.random() * 14, duration: 2200 + Math.random() * 2000,
    }))
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {bubbles.map((b) => <Bubble key={b.id} {...b} />)}
    </View>
  );
};


// ===== FIREFLIES - Lucioles vagabondes (continu, pas de reset) =====

const Firefly = ({ stagger, startLeft, startTop }: {
  stagger: number; startLeft: number; startTop: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const alive = useRef(true);

  useEffect(() => {
    const runGlow = () => {
      if (!alive.current) return;
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.15, duration: 800, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        ]),
        Animated.delay(Math.random() * 600),
      ]).start(({ finished }) => { if (finished) runGlow(); });
    };

    const timer = setTimeout(runGlow, stagger);

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, { toValue: 20 + Math.random() * 30, duration: 2500 + Math.random() * 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(translateX, { toValue: -(20 + Math.random() * 30), duration: 2500 + Math.random() * 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: 15 + Math.random() * 20, duration: 2200 + Math.random() * 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(translateY, { toValue: -(15 + Math.random() * 20), duration: 2200 + Math.random() * 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    return () => { alive.current = false; clearTimeout(timer); opacity.stopAnimation(); glowScale.stopAnimation(); translateX.stopAnimation(); translateY.stopAnimation(); };
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', left: `${startLeft}%`, top: `${startTop}%`, alignItems: 'center', justifyContent: 'center', opacity, transform: [{ translateX }, { translateY }] }}>
      <Animated.View style={{ position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(200, 255, 50, 0.25)', transform: [{ scale: glowScale }] }} />
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#C8FF32' }} />
    </Animated.View>
  );
};

export const FirefliesFrame = ({ width, height }: FrameProps) => {
  const fireflies = useRef(
    Array.from({ length: 22 }, (_, i) => ({
      id: i, stagger: Math.random() * 2000,
      startLeft: 10 + Math.random() * 80, startTop: 10 + Math.random() * 80,
    }))
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {fireflies.map((f) => <Firefly key={f.id} {...f} />)}
    </View>
  );
};


// ===== CONFETTI - Confettis (recursive, zero flash) =====

const ConfettiPiece = ({ stagger, startLeft, color, duration, size }: {
  stagger: number; startLeft: number; color: string; duration: number; size: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const alive = useRef(true);

  useEffect(() => {
    const rest = 800 + Math.random() * 500;
    const swayAmount = 15 + Math.random() * 20;
    const swayDuration = 600 + Math.random() * 400;

    const runCycle = () => {
      if (!alive.current) return;
      translateY.setValue(-10);
      rotateAnim.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 140, duration, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 1, duration, useNativeDriver: true }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.delay(rest),
      ]).start(({ finished }) => { if (finished) runCycle(); });
    };

    const timer = setTimeout(runCycle, stagger);

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, { toValue: swayAmount, duration: swayDuration, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(translateX, { toValue: -swayAmount, duration: swayDuration, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    return () => { alive.current = false; clearTimeout(timer); opacity.stopAnimation(); translateY.stopAnimation(); translateX.stopAnimation(); rotateAnim.stopAnimation(); };
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{
      position: 'absolute', left: `${startLeft}%`, top: 0,
      width: size, height: size * 1.6, backgroundColor: color, borderRadius: 1,
      opacity, transform: [{ translateY }, { translateX }, { rotate: spin }],
    }} />
  );
};

export const ConfettiFrame = ({ width, height }: FrameProps) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#F8B500', '#6C5CE7'];
  const confetti = useRef(
    Array.from({ length: 26 }, (_, i) => ({
      id: i, stagger: Math.random() * 2500,
      startLeft: 3 + Math.random() * 94, color: colors[i % colors.length],
      duration: 2000 + Math.random() * 1500, size: 5 + Math.random() * 4,
    }))
  ).current;

  return (
    <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
      {confetti.map((c) => <ConfettiPiece key={c.id} {...c} />)}
    </View>
  );
};


// ===== CADRE COULEUR =====

export const ColorFrame = ({ width, height, color }: FrameProps & { color: string }) => (
  <View style={[styles.frameContainer, { width, height }]} pointerEvents="none">
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 12, borderColor: color }} />
  </View>
);


// ===== COMPOSANTS PRINCIPAUX =====

export const StoryFrame = ({ type, width, height }: { type: FrameType; width: number; height: number }) => {
  switch (type) {
    case 'blue': return <ColorFrame width={width} height={height} color="#3B82F6" />;
    case 'pink': return <ColorFrame width={width} height={height} color="#EC4899" />;
    case 'red': return <ColorFrame width={width} height={height} color="#EF4444" />;
    case 'black': return <ColorFrame width={width} height={height} color="#000000" />;
    case 'white': return <ColorFrame width={width} height={height} color="#FFFFFF" />;
    case 'yellow': return <ColorFrame width={width} height={height} color="#F59E0B" />;
    case 'green': return <ColorFrame width={width} height={height} color="#10B981" />;
    case 'purple': return <ColorFrame width={width} height={height} color="#8B5CF6" />;
    case 'gold': return <ColorFrame width={width} height={height} color="#FFD700" />;
    case 'none': default: return null;
  }
};

export const StoryEffect = ({ type, width, height }: { type: EffectType; width: number; height: number }) => {
  switch (type) {
    case 'stars': return <StarsFrame width={width} height={height} />;
    case 'fairy': return <FairyFrame width={width} height={height} />;
    case 'magic': return <MagicFrame width={width} height={height} />;
    case 'snow': return <SnowFrame width={width} height={height} />;
    case 'hearts': return <HeartsFrame width={width} height={height} />;
    case 'bubbles': return <BubblesFrame width={width} height={height} />;
    case 'fireflies': return <FirefliesFrame width={width} height={height} />;
    case 'confetti': return <ConfettiFrame width={width} height={height} />;
    case 'none': default: return null;
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
    frame: {
    position: 'absolute',
    overflow: 'hidden',
  },
  heart: {
    position: 'absolute',
  },
});

export default StoryFrame;
