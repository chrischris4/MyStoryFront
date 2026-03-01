import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import PlatformBlur from '~/components/PlatformBlur';
import { useTranslation } from 'react-i18next';
import type { FrameType, EffectType, TextStylePreset } from './StoryFrames';
import { TEXT_STYLE_PRESETS } from './StoryFrames';

interface FrameMenuProps {
  visible: boolean;
  frameMenuAnim: Animated.Value;
  isNight: boolean;
  maxWidth: number;
  selectedFrame: FrameType;
  onSelectFrame: (frame: FrameType) => void;
  selectedEffect: EffectType;
  onSelectEffect: (effect: EffectType) => void;
  selectedTextStyle: TextStylePreset;
  onSelectTextStyle: (preset: TextStylePreset) => void;
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

type TabId = 'frame' | 'effect' | 'text';

export default function FrameMenu({
  visible,
  frameMenuAnim,
  isNight,
  maxWidth,
  selectedFrame,
  onSelectFrame,
  selectedEffect,
  onSelectEffect,
  selectedTextStyle,
  onSelectTextStyle,
}: FrameMenuProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('frame');


  const tabs: { id: TabId; label: string }[] = [
    { id: 'frame', label: t('storyReader.frame') },
    { id: 'effect', label: t('storyReader.effect') },
    { id: 'text', label: t('storyReader.textStyle') },
  ];

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
      <PlatformBlur
        intensity={90}
        tint={isNight ? 'dark' : 'light'}
        style={{ borderRadius: 16, overflow: 'hidden' }}
      >
        <View style={{ padding: 12, backgroundColor: 'rgba(255,255,255,0.5)' }}>
          {/* Tab bar */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: activeTab === tab.id ? '#5FD5FF' : '#00000010',
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? '700' : '400',
                  color: 'black',
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contenu de l'onglet actif */}
          {activeTab === 'frame' && (
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
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: frame.color,
                    ...(frame.borderColor ? { borderWidth: 1, borderColor: frame.borderColor } : {}),
                  }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {activeTab === 'effect' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -12 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
              <TouchableOpacity onPress={() => onSelectEffect('none')} style={{ borderRadius: 12, padding: 8, backgroundColor: selectedEffect === 'none' ? '#5FD5FF50' : 'transparent', alignItems: 'center' }}>
                <Feather name="x-circle" size={36} color={isNight ? '#aaa' : '#555'} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onSelectEffect('stars')} style={{ borderRadius: 12, padding: 8, backgroundColor: selectedEffect === 'stars' ? '#5FD5FF50' : 'transparent', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <MaterialIcons name="star" size={20} color="#FFD700" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSelectEffect('hearts')} style={{ borderRadius: 12, padding: 8, backgroundColor: selectedEffect === 'hearts' ? '#5FD5FF50' : 'transparent', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <MaterialIcons name="favorite" size={20} color="#FF4D6D" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onSelectEffect('fairy')} style={{ borderRadius: 12, padding: 8, backgroundColor: selectedEffect === 'fairy' ? '#5FD5FF50' : 'transparent', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <View style={{ position: 'absolute', top: 5, left: 10, width: 4, height: 4, backgroundColor: '#FFD700', borderRadius: 2 }} />
                  <View style={{ position: 'absolute', top: 12, right: 8, width: 3, height: 3, backgroundColor: '#FFD700', borderRadius: 1.5 }} />
                  <View style={{ position: 'absolute', bottom: 8, left: 7, width: 3, height: 3, backgroundColor: '#FFC107', borderRadius: 1.5 }} />
                  <View style={{ position: 'absolute', bottom: 5, right: 10, width: 4, height: 4, backgroundColor: '#FFD700', borderRadius: 2 }} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onSelectEffect('magic')} style={{ borderRadius: 12, padding: 8, backgroundColor: selectedEffect === 'magic' ? '#5FD5FF50' : 'transparent', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, backgroundColor: '#9B59B6', opacity: 0.6, borderRadius: 18 }} />
                  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, backgroundColor: '#3498DB', opacity: 0.5, borderRadius: 18 }} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onSelectEffect('snow')} style={{ borderRadius: 12, padding: 8, backgroundColor: selectedEffect === 'snow' ? '#5FD5FF50' : 'transparent', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#4A90A4', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <View style={{ position: 'absolute', top: 4, left: 8, width: 4, height: 4, backgroundColor: '#FFF', borderRadius: 2 }} />
                  <View style={{ position: 'absolute', top: 12, right: 6, width: 3, height: 3, backgroundColor: '#FFF', borderRadius: 1.5 }} />
                  <View style={{ position: 'absolute', bottom: 8, left: 14, width: 5, height: 5, backgroundColor: '#FFF', borderRadius: 2.5 }} />
                  <View style={{ position: 'absolute', bottom: 4, right: 12, width: 3, height: 3, backgroundColor: '#FFF', borderRadius: 1.5 }} />
                </View>
              </TouchableOpacity>



              <TouchableOpacity onPress={() => onSelectEffect('bubbles')} style={{ borderRadius: 12, padding: 8, backgroundColor: selectedEffect === 'bubbles' ? '#5FD5FF50' : 'transparent', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <View style={{ position: 'absolute', top: 5, left: 8, width: 8, height: 8, borderWidth: 1.5, borderColor: '#87CEEB', borderRadius: 4, backgroundColor: 'rgba(135, 206, 250, 0.2)' }} />
                  <View style={{ position: 'absolute', bottom: 6, right: 6, width: 10, height: 10, borderWidth: 1.5, borderColor: '#87CEEB', borderRadius: 5, backgroundColor: 'rgba(135, 206, 250, 0.2)' }} />
                  <View style={{ position: 'absolute', top: 14, right: 10, width: 6, height: 6, borderWidth: 1, borderColor: '#87CEEB', borderRadius: 3, backgroundColor: 'rgba(135, 206, 250, 0.2)' }} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onSelectEffect('confetti')} style={{ borderRadius: 12, padding: 8, backgroundColor: selectedEffect === 'confetti' ? '#5FD5FF50' : 'transparent', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <View style={{ position: 'absolute', top: 4, left: 8, width: 4, height: 6, backgroundColor: '#FF6B6B', borderRadius: 1, transform: [{ rotate: '15deg' }] }} />
                  <View style={{ position: 'absolute', top: 8, right: 8, width: 4, height: 6, backgroundColor: '#4ECDC4', borderRadius: 1, transform: [{ rotate: '-20deg' }] }} />
                  <View style={{ position: 'absolute', bottom: 6, left: 12, width: 4, height: 6, backgroundColor: '#FFE66D', borderRadius: 1, transform: [{ rotate: '30deg' }] }} />
                  <View style={{ position: 'absolute', bottom: 10, right: 10, width: 4, height: 6, backgroundColor: '#AA96DA', borderRadius: 1, transform: [{ rotate: '-10deg' }] }} />
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}

          {activeTab === 'text' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -12 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
              {TEXT_STYLE_PRESETS.map((preset) => {
                const isSelected = selectedTextStyle.id === preset.id;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => onSelectTextStyle(preset)}
                    style={{
                      borderRadius: 12,
                      padding: 8,
                      backgroundColor: isSelected ? '#5FD5FF50' : 'transparent',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: preset.bgColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: preset.textColor }}>Aa</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </PlatformBlur>
    </Animated.View>
  );
}
