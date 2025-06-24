import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface PageSelectorProps {
  numPages: number;
  setNumPages: (n: number) => void;
}

export default function PageSelector({ numPages, setNumPages }: PageSelectorProps) {
  const maxPages = 10;

  const [currentIndex, setCurrentIndex] = useState(numPages - 1);
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
    <View className="p-4 rounded-3xl bg-[#B4CDED] text-center mb-4">
      <Text className="text-lg font-semibold mb-4">Nombre de pages</Text>

      <View className="flex-row justify-end items-center space-x-10">
        <TouchableOpacity onPress={goLeft} disabled={currentIndex === 0}>
          <Feather
            name="chevron-left"
            size={28}
            color={currentIndex === 0 ? '#B4CDED' : 'black'}
          />
        </TouchableOpacity>

        <View className="overflow-hidden w-20 h-12 justify-center items-center">
          <Animated.Text
            style={{
              color: 'black',
              fontSize: 36,
              fontWeight: 'bold',
              transform: [{ translateX }],
            }}
          >
            {currentIndex + 1}
          </Animated.Text>
        </View>

        <TouchableOpacity onPress={goRight} disabled={currentIndex === maxPages - 1}>
          <Feather
            name="chevron-right"
            size={28}
            color={currentIndex === maxPages - 1 ? '#B4CDED' : 'black'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
