import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import type { FrameType, EffectType } from './StoryFrames';

interface FrameMenuProps {
  visible: boolean;
  frameMenuAnim: Animated.Value;
  isNight: boolean;
  maxWidth: number;
  selectedFrame: FrameType;
  onSelectFrame: (frame: FrameType) => void;
  selectedEffect: EffectType;
  onSelectEffect: (effect: EffectType) => void;
}

const FRAME_OPTIONS: { type: FrameType; color: string; translationKey: string; borderColor?: string }[] = [
  { type: 'black', color: '#000000', translationKey: 'storyReader.frameBlack', borderColor: '#666' },
  { type: 'white', color: '#FFFFFF', translationKey: 'storyReader.frameWhite', borderColor: '#DDD' },
  { type: 'gold', color: '#FFD700', translationKey: 'storyReader.frameGold' },
  { type: 'blue', color: '#3B82F6', translationKey: 'storyReader.frameBlue' },
  { type: 'pink', color: '#EC4899', translationKey: 'storyReader.framePink' },
  { type: 'red', color: '#EF4444', translationKey: 'storyReader.frameRed' },
  { type: 'yellow', color: '#F59E0B', translationKey: 'storyReader.frameYellow' },
  { type: 'green', color: '#10B981', translationKey: 'storyReader.frameGreen' },
  { type: 'purple', color: '#8B5CF6', translationKey: 'storyReader.framePurple' },
];

const FRAME_SELECTED_BG: Record<string, string> = {
  black: 'rgba(0, 0, 0, 0.3)',
  white: 'rgba(200, 200, 200, 0.5)',
  gold: 'rgba(255, 215, 0, 0.3)',
  blue: 'rgba(59, 130, 246, 0.3)',
  pink: 'rgba(236, 72, 153, 0.3)',
  red: 'rgba(239, 68, 68, 0.3)',
  yellow: 'rgba(245, 158, 11, 0.3)',
  green: 'rgba(16, 185, 129, 0.3)',
  purple: 'rgba(139, 92, 246, 0.3)',
};

export default function FrameMenu({
  visible,
  frameMenuAnim,
  isNight,
  maxWidth,
  selectedFrame,
  onSelectFrame,
  selectedEffect,
  onSelectEffect,
}: FrameMenuProps) {
  const { t } = useTranslation();

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        top: 80,
        left: 0,
        zIndex: 10,
        maxWidth,
        opacity: frameMenuAnim,
        transform: [{
          translateY: frameMenuAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-10, 0],
          }),
        }],
      }}
    >
      <BlurView
        intensity={90}
        tint={isNight ? "dark" : "light"}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <View style={{ padding: 12 }} className='bg-white/50'>
          <View className='flex flex-col'>
            <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 12 }}>
              {t('storyReader.frame')}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -12 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
              {FRAME_OPTIONS.map((frame) => (
                <TouchableOpacity
                  key={frame.type}
                  onPress={() => onSelectFrame(frame.type)}
                  style={{
                    borderRadius: 12,
                    padding: 8,
                    backgroundColor: selectedFrame === frame.type ? FRAME_SELECTED_BG[frame.type] : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: frame.color,
                      ...(frame.borderColor ? { borderWidth: 1, borderColor: frame.borderColor } : {}),
                    }}
                  />
                  <Text style={{ fontSize: 11, marginTop: 4 }}>{t(frame.translationKey)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className='flex flex-col' style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 12 }}>
                {t('storyReader.effect')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -12 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
                <TouchableOpacity
                  onPress={() => onSelectEffect('none')}
                  style={{
                    borderRadius: 12,
                    padding: 8,
                    backgroundColor: selectedEffect === 'none' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Feather name="x-circle" size={36} color="#999" />
                  <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectNone')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onSelectEffect('stars')}
                  style={{
                    borderRadius: 12,
                    padding: 8,
                    backgroundColor: selectedEffect === 'stars' ? 'rgba(255, 215, 0, 0.3)' : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <View style={{ position: 'absolute', top: 6, left: 8, width: 4, height: 4, backgroundColor: '#FFD700', borderRadius: 2 }} />
                    <View style={{ position: 'absolute', top: 14, right: 7, width: 5, height: 5, backgroundColor: '#FFD700', borderRadius: 2.5 }} />
                    <View style={{ position: 'absolute', bottom: 6, left: 14, width: 3, height: 3, backgroundColor: '#FFD700', borderRadius: 1.5 }} />
                  </View>
                  <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectStars')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onSelectEffect('fairy')}
                  style={{
                    borderRadius: 12,
                    padding: 8,
                    backgroundColor: selectedEffect === 'fairy' ? 'rgba(255, 215, 0, 0.3)' : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <View style={{ position: 'absolute', top: 5, left: 10, width: 4, height: 4, backgroundColor: '#FFD700', borderRadius: 2 }} />
                    <View style={{ position: 'absolute', top: 12, right: 8, width: 3, height: 3, backgroundColor: '#FFD700', borderRadius: 1.5 }} />
                    <View style={{ position: 'absolute', bottom: 8, left: 7, width: 3, height: 3, backgroundColor: '#FFC107', borderRadius: 1.5 }} />
                    <View style={{ position: 'absolute', bottom: 5, right: 10, width: 4, height: 4, backgroundColor: '#FFD700', borderRadius: 2 }} />
                  </View>
                  <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectFairy')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onSelectEffect('magic')}
                  style={{
                    borderRadius: 12,
                    padding: 8,
                    backgroundColor: selectedEffect === 'magic' ? 'rgba(155, 89, 182, 0.3)' : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, backgroundColor: '#9B59B6', opacity: 0.6, borderRadius: 18 }} />
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, backgroundColor: '#3498DB', opacity: 0.5, borderRadius: 18 }} />
                  </View>
                  <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectMagic')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onSelectEffect('snow')}
                  style={{
                    borderRadius: 12,
                    padding: 8,
                    backgroundColor: selectedEffect === 'snow' ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#4A90A4', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <View style={{ position: 'absolute', top: 4, left: 8, width: 4, height: 4, backgroundColor: '#FFF', borderRadius: 2 }} />
                    <View style={{ position: 'absolute', top: 12, right: 6, width: 3, height: 3, backgroundColor: '#FFF', borderRadius: 1.5 }} />
                    <View style={{ position: 'absolute', bottom: 8, left: 14, width: 5, height: 5, backgroundColor: '#FFF', borderRadius: 2.5 }} />
                    <View style={{ position: 'absolute', bottom: 4, right: 12, width: 3, height: 3, backgroundColor: '#FFF', borderRadius: 1.5 }} />
                  </View>
                  <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectSnow')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onSelectEffect('hearts')}
                  style={{
                    borderRadius: 12,
                    padding: 8,
                    backgroundColor: selectedEffect === 'hearts' ? 'rgba(255, 107, 138, 0.3)' : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <Text style={{ fontSize: 18 }}>💕</Text>
                  </View>
                  <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectHearts')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onSelectEffect('bubbles')}
                  style={{
                    borderRadius: 12,
                    padding: 8,
                    backgroundColor: selectedEffect === 'bubbles' ? 'rgba(135, 206, 250, 0.3)' : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <View style={{ position: 'absolute', top: 5, left: 8, width: 8, height: 8, borderWidth: 1.5, borderColor: '#87CEEB', borderRadius: 4, backgroundColor: 'rgba(135, 206, 250, 0.2)' }} />
                    <View style={{ position: 'absolute', bottom: 6, right: 6, width: 10, height: 10, borderWidth: 1.5, borderColor: '#87CEEB', borderRadius: 5, backgroundColor: 'rgba(135, 206, 250, 0.2)' }} />
                    <View style={{ position: 'absolute', top: 14, right: 10, width: 6, height: 6, borderWidth: 1, borderColor: '#87CEEB', borderRadius: 3, backgroundColor: 'rgba(135, 206, 250, 0.2)' }} />
                  </View>
                  <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectBubbles')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onSelectEffect('confetti')}
                  style={{
                    borderRadius: 12,
                    padding: 8,
                    backgroundColor: selectedEffect === 'confetti' ? 'rgba(255, 107, 107, 0.3)' : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <View style={{ position: 'absolute', top: 4, left: 8, width: 4, height: 6, backgroundColor: '#FF6B6B', borderRadius: 1, transform: [{ rotate: '15deg' }] }} />
                    <View style={{ position: 'absolute', top: 8, right: 8, width: 4, height: 6, backgroundColor: '#4ECDC4', borderRadius: 1, transform: [{ rotate: '-20deg' }] }} />
                    <View style={{ position: 'absolute', bottom: 6, left: 12, width: 4, height: 6, backgroundColor: '#FFE66D', borderRadius: 1, transform: [{ rotate: '30deg' }] }} />
                    <View style={{ position: 'absolute', bottom: 10, right: 10, width: 4, height: 6, backgroundColor: '#AA96DA', borderRadius: 1, transform: [{ rotate: '-10deg' }] }} />
                  </View>
                  <Text style={{ fontSize: 11, marginTop: 4 }}>{t('storyReader.effectConfetti')}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}
