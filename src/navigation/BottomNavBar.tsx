import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '~/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BottomNavBar() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList>>();

  // Tableau des boutons avec leur écran et icône
  const navItems = [
    { screen: 'Home', icon: 'home' },
    { screen: 'Stories', icon: 'book' },
    { screen: 'CreateStory', icon: 'plus-circle' },
    { screen: 'SettingsScreen', icon: 'settings' },
    { screen: 'BillingScreen', icon: 'shopping-cart' },
  ];

  return (
    <View className="absolute bottom-2 left-2 right-2 h-16 flex flex-row justify-around items-center rounded-xl shadow-md z-10">
      {navItems.map((item) => {
        // On ne montre pas l'icône de l'écran courant
        if (route.name === item.screen) return null;

        return (
          <TouchableOpacity
            key={item.screen}
            onPress={() => navigation.navigate(item.screen as keyof RootStackParamList)}
            className="items-center"
          >
            <Feather
              name={item.icon as keyof typeof Feather.glyphMap}
              size={item.screen === 'CreateStory' ? 26 : 24}
              color="#E6F9F8"
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
