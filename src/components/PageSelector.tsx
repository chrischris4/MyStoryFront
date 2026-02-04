import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface PageSelectorProps {
  numPages: number;
  setNumPages: (n: number) => void;
  isNight: boolean,
}

export default function PageSelector({ numPages, setNumPages, isNight }: PageSelectorProps) {
  const { t } = useTranslation();
  const maxPages = 16;

  const [currentIndex, setCurrentIndex] = useState(numPages - 8);
  const translateX = useRef(new Animated.Value(0)).current;
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const animateSlide = (dir: 'left' | 'right') => {
    translateX.setValue(dir === 'right' ? 100 : -100);

    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const goLeft = () => {
    if (currentIndex > 0) {
      setDirection('left');
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setNumPages(newIndex + 1);
      animateSlide('left');
    }
  };

  const goRight = () => {
    if (currentIndex < maxPages - 1) {
      setDirection('right');
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setNumPages(newIndex + 1);
      animateSlide('right');
    }
  };

  useEffect(() => {
    setCurrentIndex(numPages - 1);
  }, [numPages]);

  return (
    <View className="text-center mb-4">
      <Text className={` ${isNight ? "text-white" : "text-slate-900"} text-2xl font-baloo-semibold mb-4`}>{t('storyCreation.numPages')}</Text>

      <View className="flex-row justify-end items-center space-x-10">
        <TouchableOpacity onPress={goLeft} disabled={currentIndex === 0}>
          <Feather
            name="chevron-left"
            size={28}
            color={currentIndex === 0 ? (isNight ? '#4A5568' : '#B4CDED') : (isNight ? '#E5E7EB' : 'black')}
          />
        </TouchableOpacity>

        <View className="overflow-hidden w-20 h-12 justify-center items-center">
          <Animated.Text
            style={{
              color: isNight ? '#E5E7EB' : 'black',
              fontSize: 36,
              transform: [{ translateX }],
            }}
            className='font-baloo-semibold -mt-2'
          >
            {currentIndex + 1}
          </Animated.Text>
        </View>

        <TouchableOpacity onPress={goRight} disabled={currentIndex === maxPages - 1}>
          <Feather
            name="chevron-right"
            size={28}
            color={currentIndex === maxPages - 1 ? (isNight ? '#4A5568' : '#B4CDED') : (isNight ? '#E5E7EB' : 'black')}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
