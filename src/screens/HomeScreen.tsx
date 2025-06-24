import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeButton from '~/components/HomeButton';
import StyledButton from '~/components/StyledButton';
import BottomNavBar from '~/navigation/BottomNavBar';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/navigation/AppNavigator';


type UserProfile = {
  firstName: string;
  lastName: string;
  imageUrl: string;
  storyCoin: number;
};

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Erreur', 'Utilisateur non authentifié');
        setLoading(false);
        return;
      }

      const res = await fetch('http://192.168.1.95:3000/profile/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({
          firstName: data.name || 'Prénom',
          lastName: data.lastname || 'Nom',
          imageUrl: data.imageUrl || 'https://randomuser.me/api/portraits/men/75.jpg',
          storyCoin: data.storyCoin || 0,
        });
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer le profil');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center bg-[#ffffff] w-full">
      <View className="flex flex-row mt-8 w-11/12 items-center relative">
        <Image
          source={{ uri: profile?.imageUrl || 'https://randomuser.me/api/portraits/men/75.jpg' }}
          className="w-24 h-24 rounded-full"
        />
        <View className="flex flex-col ml-4">
          <Text className="text-lg font-bold text-slate-700">{profile?.firstName || 'Jean'}</Text>
          <Text className="text-lg font-light text-slate-700">{profile?.lastName || 'Dupont'}</Text>
        </View>
        <View className="flex flex-row items-center justify-center ml-4 absolute top-0 right-0 bg-rose-500 rounded-full w-20 h-20">
          <Text className="text-lg font-bold text-white mr-2">{profile?.storyCoin || '0'}</Text>
          <Feather name="disc" size={24} color="#ffffff" />
        </View>
      </View>

      <View className="gap-4 flex flex-row w-11/12 my-4">
        <StyledButton title="Créer une histoire" icon={<Feather name="plus" size={24} color="#fff" />} />
        <StyledButton title="Modifier le profil" icon={<Feather name="edit-3" size={24} color="#fff" />} />
      </View>
      <View className="flex flex-col gap-4 w-11/12">
        <HomeButton
          onPress={() => navigation.navigate('Stories')}
          title="Mes histoires"
          description="Laissez parler votre imagination"
          icon={<Feather name="book" size={24} color="#334155" />}
        />
        <HomeButton
          onPress={() => navigation.navigate('PurchaseScreen')}
          title="Achat"
          description="Obtenir des jetons, gérer votre abonnement"
          icon={<Feather name="shopping-cart" size={24} color="#334155" />}
        />
        <HomeButton
          onPress={() => navigation.navigate('CreateStory')}
          title="Créer une histoire"
          description="Laissez parler votre imagination"
          icon={<Feather name="users" size={24} color="#334155" />}
        />
      </View>
      <BottomNavBar />
    </View>
  );
}
