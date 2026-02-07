import { useRef } from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions, Animated, PanResponder } from 'react-native';
import { useStoryCreationStore } from '~/store/useStoryCreationStore';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';

export default function FloatingStoryCreation() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isCreating, isMinimized, loading, storyPages, title, maximize, close } = useStoryCreationStore();

  const { width, height } = useWindowDimensions();
  const miniWidth = width * 0.35;
  const miniHeight = miniWidth * 1.4;

  // Position de la fenêtre flottante
  const pan = useRef(new Animated.ValueXY({ x: width - miniWidth - 16, y: 60 })).current;
  const lastTap = useRef(0);
  const panValue = useRef({ x: width - miniWidth - 16, y: 60 });

  // Gérer le drag
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Activer seulement si on bouge de plus de 5px
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: panValue.current.x,
          y: panValue.current.y,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        // Détecter un double tap pour ouvrir
        const now = Date.now();
        if (now - lastTap.current < 300 && Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          handlePress();
        }
        lastTap.current = now;

        // Calculer la nouvelle position
        const newX = panValue.current.x + gestureState.dx;
        const newY = panValue.current.y + gestureState.dy;

        // Limiter la position pour rester dans l'écran (20px de tous les côtés sauf bas à 100px)
        const minX = 20;
        const maxX = width - miniWidth - 20;
        const minY = 20;
        const maxY = height - miniHeight - 100; // 100 pour la navbar

        let finalX = newX;
        let finalY = newY;

        if (finalX < minX) finalX = minX;
        if (finalX > maxX) finalX = maxX;
        if (finalY < minY) finalY = minY;
        if (finalY > maxY) finalY = maxY;

        // Sauvegarder la nouvelle position
        panValue.current = { x: finalX, y: finalY };

        Animated.spring(pan, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  if (!isCreating || !isMinimized) {
    return null;
  }

  const handlePress = () => {
    maximize();
    // Naviguer vers le tab CreateStory
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: 'CreateStory',
        },
      })
    );
  };

  const handleClose = () => {
    close();
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        width: miniWidth,
        height: miniHeight,
        backgroundColor: '#1F2937',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 9999,
        borderColor: loading ? '#3B82F6' : '#10B981',
        borderWidth: 2,
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
      }}
    >
      <View style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center p-2">
          {loading ? (
            <>
              <LottieView
                source={require('../../assets/animations/LoadingWhite.json')}
                autoPlay
                loop={true}
                style={{ width: 80, height: 80 }}
              />
              <Text className="text-white text-[10px] text-center mt-1 font-medium">
                {t('storyCreation.creating')}
              </Text>

              <Text className="text-gray-400 text-[9px] text-center mt-0.5">
                {title}
              </Text>
            </>
          ) : (
            <>
              <Feather name="check-circle" size={miniWidth * 0.35} color="#10B981" />
              <Text className="text-white text-[10px] text-center mt-1 font-semibold">
                {t('storyCreation.finished')}
              </Text>
              <Text className="text-gray-400 text-[9px] text-center mt-0.5" numberOfLines={1}>
                {storyPages.length} {t('storyCreation.pages')}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Bouton de fermeture */}
      <TouchableOpacity
        onPress={handleClose}
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 12,
          width: 24,
          height: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name="x" size={16} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
}
