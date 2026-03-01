import React from 'react';
import { Platform, View } from 'react-native';
import { BlurView, BlurViewProps } from 'expo-blur';

type PlatformBlurProps = BlurViewProps & {
  children?: React.ReactNode;
};


function getAndroidBg(bg: string | undefined, tint: string | undefined): string {
  if (!bg) {
    return tint === 'dark' ? '#252836' : '#83E0FF';
  }

  const base = bg.startsWith('#') ? bg.slice(0, 7).toLowerCase() : null;

  // Sky blue default → light blue
  if (base === '#38b6ff' || base === '#87ceeb') return '#83E0FF';
  // Night default → near black
  if (base === '#1e293b' || base === '#161A21' || base === '#020205') return '#161A21';
  // Blue accent → dark blue (night) / light blue (day)
  if (base === '#3b82f6') return tint === 'dark' ? '#2563eb' : '#dbeafe';

  // Strip alpha for other hex colors
  if (bg.startsWith('#') && bg.length === 9) return bg.slice(0, 7);

  // rgba → strip alpha
  const rgbaMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) return `rgb(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]})`;

  return bg;
}

export default function PlatformBlur({ style, tint, children, intensity, blurReductionFactor, experimentalBlurMethod, ...viewProps }: PlatformBlurProps) {
  if (Platform.OS !== 'android') {
    return (
      <BlurView style={style} tint={tint} intensity={intensity} blurReductionFactor={blurReductionFactor} experimentalBlurMethod={experimentalBlurMethod} {...viewProps}>
        {children}
      </BlurView>
    );
  }

  const flatStyle = style as any;
  const androidBg = getAndroidBg(flatStyle?.backgroundColor, tint as string);

  return (
    <View
      style={[
        style,
        { backgroundColor: androidBg },
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
}
