import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from 'expo-audio';

type SoundName = 'click' | 'pop' | 'success' | 'error' | 'toggle';

// Configuration des sons avec leur volume (0 à 1)
const soundConfig: Record<SoundName, { source: any; volume: number }> = {
  click: { source: require('../../assets/sounds/click.wav'), volume: 0.5 },
  pop: { source: require('../../assets/sounds/pop.mp3'), volume: 0.5 },
  success: { source: require('../../assets/sounds/success.wav'), volume: 0.6 },
  error: { source: require('../../assets/sounds/error.wav'), volume: 0.6 },
  toggle: { source: require('../../assets/sounds/toggle.wav'), volume: 0.5 },
};

interface SoundContextType {
  playSound: (name: SoundName) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Composant pour gérer un son individuel
function SoundPlayer({
  source,
  volume,
  onReady
}: {
  source: any;
  volume: number;
  onReady: (play: () => void) => void;
}) {
  const player = useAudioPlayer(source);

  useEffect(() => {
    player.volume = volume;
    onReady(() => {
      player.seekTo(0);
      player.play();
    });
  }, [player, volume, onReady]);

  return null;
}

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const playFunctionsRef = useRef<Record<SoundName, () => void>>({} as Record<SoundName, () => void>);
  const [isReady, setIsReady] = useState(false);
  const readyCountRef = useRef(0);
  const totalSounds = Object.keys(soundConfig).length;

  const handleSoundReady = (name: SoundName) => (playFn: () => void) => {
    playFunctionsRef.current[name] = playFn;
    readyCountRef.current += 1;
    if (readyCountRef.current >= totalSounds) {
      setIsReady(true);
    }
  };

  const playSound = (name: SoundName) => {
    if (!isReady) {
      return;
    }
    const playFn = playFunctionsRef.current[name];
    if (playFn) {
      try {
        playFn();
      } catch (error) {
        console.warn(`❌ Failed to play sound: ${name}`, error);
      }
    }
  };

  return (
    <SoundContext.Provider value={{ playSound }}>
      {Object.entries(soundConfig).map(([name, config]) => (
        <SoundPlayer
          key={name}
          source={config.source}
          volume={config.volume}
          onReady={handleSoundReady(name as SoundName)}
        />
      ))}
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
