import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeButton from '~/components/HomeButton';
import StyledButton from '~/components/StyledButton';
import BottomNavBar from '~/navigation/BottomNavBar';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/navigation/AppNavigator';
import Background from '~/components/Background';
import { BlurView } from 'expo-blur';
import { useTheme } from '~/context/ThemeContext';


type UserProfile = {
  firstName: string;
  lastName: string;
  imageUrl: string;
  storyCoin: number;
};

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { isNight, toggleTheme } = useTheme();
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
    <View className="flex-1 relative">
      {/* 🌤️ Background animé */}
      <Background isNight={isNight} />
      {/* 🌟 Contenu principal au-dessus */}
      <View className="flex-1 items-center w-full absolute top-0 left-0 right-0 bottom-0">
        <View className="flex flex-row mt-8 w-11/12 items-center relative">
          <View className="flex flex-col items-center mx-auto">

            <View
              style={{
                width: 140,
                height: 140,
                borderRadius: 104,
                shadowColor: isNight ? '#FFFFFF' : '#FBBF24',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 10,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={{ uri: profile?.imageUrl || 'https://randomuser.me/api/portraits/men/75.jpg' }}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 104,
                  borderWidth: 4,
                  borderColor: isNight ? '#FFFFFF' : '#FACC15',
                }}
              />
            </View>
            <View className="flex flex-col mt-2">
              <Text className={` ${isNight ? "text-[#eaeeff]" : "text-slate-700"} text-3xl font-semibold mb-4`}>{profile?.firstName || 'Jean'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={toggleTheme}
          className="absolute top-8 left-4 rounded-full overflow-hidden"
        >
          <BlurView intensity={30} tint="light" className="p-4">
            {isNight ? (
              <Feather name="sun" size={24} color="#fff" />
            ) : (
              <Feather name="moon" size={24} color="#fff" />
            )}
          </BlurView>
        </TouchableOpacity>



        <View className="flex flex-col gap-4 w-11/12">
          <View className='flex-row gap-4'>
            <HomeButton
              style="half"
              isNight={isNight}
              onPress={() => navigation.navigate('Stories')}
              title="Mes histoires"
              description="Laissez parler votre imagination"
              icon={<Feather name="book" size={24} color="#334155" />}
            />
            <HomeButton
              style="half"

              isNight={isNight}
              onPress={() => navigation.navigate('CreateStory')}
              title="Créer une histoire"
              description="Laissez parler votre imagination"
              icon={<Feather name="users" size={24} color="#334155" />}
            />
          </View>
          <HomeButton
            isNight={isNight}
            onPress={() => navigation.navigate('SharedStories')}
            title="Découvrir"
            description="Parcourez les histoires partagées par d'autres utilisateus !"
            icon={<Feather name="book" size={24} color="#334155" />}
          />

        </View>
        <BottomNavBar />
      </View>
    </View>
  );

}
