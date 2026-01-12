import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

type SoundName = 'click' | 'pop' | 'success' | 'error' | 'toggle';

// Configuration des sons - les chemins doivent être statiques pour React Native
const soundFiles: Record<SoundName, any> = {
  click: require('../../assets/sounds/click.wav'),
  pop: require('../../assets/sounds/pop.mp3'),
  success: require('../../assets/sounds/success.wav'),
  error: require('../../assets/sounds/error.wav'),
  toggle: require('../../assets/sounds/toggle.wav'),
};

interface SoundContextType {
  playSound: (name: SoundName) => Promise<void>;
  isLoaded: boolean;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const soundsRef = useRef<Record<string, Audio.Sound>>({});
  const isLoadedRef = useRef(false);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        // console.log('🔊 Starting to load sounds...');

        // Configurer le mode audio
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          allowsRecordingIOS: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        const loadedSounds: Record<string, Audio.Sound> = {};

        for (const [name, source] of Object.entries(soundFiles)) {
          if (source) {
            try {
              // console.log(`🔊 Loading sound: ${name}`);
              const { sound } = await Audio.Sound.createAsync(source, {
                shouldPlay: false,
                volume: 1.0,
              });
              await sound.setVolumeAsync(1.0);
              loadedSounds[name] = sound;
              // console.log(`✅ Sound loaded successfully: ${name}`);
            } catch (error) {
              console.warn(`❌ Failed to load sound: ${name}`, error);
            }
          }
        }

        soundsRef.current = loadedSounds;
        isLoadedRef.current = true;
        // console.log(`🔊 All sounds loaded. Total: ${Object.keys(loadedSounds).length}`);
      } catch (error) {
        console.error('❌ Error loading sounds:', error);
      }
    };

    loadSounds();

    return () => {
      Object.values(soundsRef.current).forEach(sound => {
        sound.unloadAsync().catch(() => {});
      });
    };
  }, []);

  const playSound = async (name: SoundName) => {
    try {
      // console.log(`🔊 Attempting to play sound: ${name}`);
      // console.log(`🔊 isLoaded: ${isLoadedRef.current}`);
      // console.log(`🔊 Available sounds:`, Object.keys(soundsRef.current));

      const sound = soundsRef.current[name];
      if (!sound) {
        console.warn(`⚠️ Sound not found: ${name}`);
        return;
      }

      if (!isLoadedRef.current) {
        console.warn(`⚠️ Sounds not loaded yet`);
        return;
      }

      await sound.setPositionAsync(0);
      await sound.playAsync();
      // console.log(`✅ Playing sound: ${name}`);
    } catch (error) {
      console.warn(`❌ Failed to play sound: ${name}`, error);
    }
  };

  return (
    <SoundContext.Provider value={{ playSound, isLoaded: isLoadedRef.current }}>
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
