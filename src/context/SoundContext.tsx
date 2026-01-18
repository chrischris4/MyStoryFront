import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SoundName = 'click' | 'pop' | 'success' | 'error' | 'toggle';

// Configuration des sons avec leur volume (0 à 1)
const soundConfig: Record<SoundName, { source: any; volume: number }> = {
  click: { source: require('../../assets/sounds/click.wav'), volume: 0.5 },
  pop: { source: require('../../assets/sounds/pop.mp3'), volume: 0.5 },
  success: { source: require('../../assets/sounds/success.wav'), volume: 0.6 },
  error: { source: require('../../assets/sounds/error.wav'), volume: 0.6 },
  toggle: { source: require('../../assets/sounds/toggle.wav'), volume: 0.5 },
};

// Musique de fond
const backgroundMusicSource = require('../../assets/sounds/Petite Boucle de Joie.mp3');
const MUSIC_VOLUME_KEY = '@music_volume';
const MUSIC_ENABLED_KEY = '@music_enabled';

interface SoundContextType {
  playSound: (name: SoundName) => void;
  // Musique de fond
  playBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  toggleBackgroundMusic: () => void;
  setMusicVolume: (volume: number) => void;
  musicVolume: number;
  isMusicPlaying: boolean;
  isMusicEnabled: boolean;
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

// Composant pour gérer la musique de fond
function BackgroundMusicPlayer({
  onReady,
  volume,
}: {
  onReady: (controls: { play: () => void; pause: () => void; setVolume: (v: number) => void }) => void;
  volume: number;
}) {
  const player = useAudioPlayer(backgroundMusicSource);

  useEffect(() => {
    player.loop = true;
    player.volume = volume;
    onReady({
      play: () => player.play(),
      pause: () => player.pause(),
      setVolume: (v: number) => {
        player.volume = v;
      },
    });
  }, [player, onReady]);

  useEffect(() => {
    player.volume = volume;
  }, [player, volume]);

  return null;
}

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const playFunctionsRef = useRef<Record<SoundName, () => void>>({} as Record<SoundName, () => void>);
  const [isReady, setIsReady] = useState(false);
  const readyCountRef = useRef(0);
  const totalSounds = Object.keys(soundConfig).length;

  // État de la musique de fond
  const [musicVolume, setMusicVolumeState] = useState(0.3);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const musicControlsRef = useRef<{ play: () => void; pause: () => void; setVolume: (v: number) => void } | null>(null);

  // Charger les préférences au démarrage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedVolume = await AsyncStorage.getItem(MUSIC_VOLUME_KEY);
        const savedEnabled = await AsyncStorage.getItem(MUSIC_ENABLED_KEY);
        if (savedVolume !== null) {
          setMusicVolumeState(parseFloat(savedVolume));
        }
        if (savedEnabled !== null) {
          setIsMusicEnabled(savedEnabled === 'true');
        }
      } catch (error) {
        console.warn('Failed to load music preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const handleSoundReady = (name: SoundName) => (playFn: () => void) => {
    playFunctionsRef.current[name] = playFn;
    readyCountRef.current += 1;
    if (readyCountRef.current >= totalSounds) {
      setIsReady(true);
    }
  };

  const handleMusicReady = (controls: { play: () => void; pause: () => void; setVolume: (v: number) => void }) => {
    musicControlsRef.current = controls;
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

  const playBackgroundMusic = () => {
    if (musicControlsRef.current && isMusicEnabled) {
      musicControlsRef.current.play();
      setIsMusicPlaying(true);
    }
  };

  const pauseBackgroundMusic = () => {
    if (musicControlsRef.current) {
      musicControlsRef.current.pause();
      setIsMusicPlaying(false);
    }
  };

  const toggleBackgroundMusic = async () => {
    const newEnabled = !isMusicEnabled;
    setIsMusicEnabled(newEnabled);
    await AsyncStorage.setItem(MUSIC_ENABLED_KEY, String(newEnabled));

    if (newEnabled && musicControlsRef.current) {
      musicControlsRef.current.play();
      setIsMusicPlaying(true);
    } else if (musicControlsRef.current) {
      musicControlsRef.current.pause();
      setIsMusicPlaying(false);
    }
  };

  const setMusicVolume = async (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setMusicVolumeState(clampedVolume);
    await AsyncStorage.setItem(MUSIC_VOLUME_KEY, String(clampedVolume));
    if (musicControlsRef.current) {
      musicControlsRef.current.setVolume(clampedVolume);
    }
  };

  return (
    <SoundContext.Provider
      value={{
        playSound,
        playBackgroundMusic,
        pauseBackgroundMusic,
        toggleBackgroundMusic,
        setMusicVolume,
        musicVolume,
        isMusicPlaying,
        isMusicEnabled,
      }}
    >
      {Object.entries(soundConfig).map(([name, config]) => (
        <SoundPlayer
          key={name}
          source={config.source}
          volume={config.volume}
          onReady={handleSoundReady(name as SoundName)}
        />
      ))}
      <BackgroundMusicPlayer onReady={handleMusicReady} volume={musicVolume} />
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
