import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import HomeButton from '~/components/HomeButton';
import StyledButton from '~/components/StyledButton';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '~/navigation/AppNavigator';
import Background from '~/components/Background';
import { BlurView } from 'expo-blur';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { useUserStore } from '~/store/useUserStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { isNight } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  // Récupérer les données depuis Zustand au lieu de faire un fetch
  const user = useUserStore((state) => state.user);
  const profile = {
    name: user?.profil.name || 'Prénom',
    isPremium: user?.isPremium,
    imageUrl: user?.profil.imageUrl,
    storyCoin: user?.storyCoin || 0,
  };

//   useEffect(() => {
//   const logAuthState = async () => {
//     const userString = await AsyncStorage.getItem('user');
//     const user = userString ? JSON.parse(userString) : null;
//     console.log('📧 Email:', user?.email);
//     console.log('👤 Username:', user?.profil?.name);
//     console.log('🆔 User ID:', user?.id);
//   };

//   logAuthState();
// }, []);

  return (
    <View className="flex-1 relative">
      {/* 🌤️ Background animé */}
      <Background isNight={isNight} />
      {/* 🌟 Contenu principal au-dessus */}
      <View className="flex-1 items-center w-full absolute top-0 left-0 right-0 bottom-0">
        <View className="flex flex-row mt-8 w-11/12 items-center relative">
          <View className="flex flex-col items-center mx-auto">

            <View
              className='relative'
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
                source={profile?.imageUrl ? { uri: profile.imageUrl } : require('../../assets/default-avatar.png')}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 104,
                  borderWidth: 4,
                  borderColor: isNight ? '#FFFFFF' : '#FACC15',
                }}
                className='absolute bottom-0 left-0'
              />
              {profile.isPremium && (
                <View
                  className='self-center mx-auto absolute bottom-5'
                >

                  <View className='w-[140px] h-16 relative flex items-center justify-center'>
                    <Text className="color-slate-600 text-xl font-medium mt-10 z-20">
                      Fluner
                    </Text>
                    <View
                      className='h-10 rounded-full absolute top-10 left-0 w-full'
                      style={{ backgroundColor: !isNight ? '#FFFFFF' : '#A0AEC9' }}
                    />
                    <View
                      className='h-14 w-14 rounded-full absolute -bottom-5 left-5'
                      style={{ backgroundColor: !isNight ? '#FFFFFF' : '#A0AEC9' }}
                    />
                    <View
                      className='h-14 w-14 rounded-full absolute -bottom-5 right-3'
                      style={{ backgroundColor: !isNight ? '#FFFFFF' : '#A0AEC9' }}
                    />
                    <View
                      className='h-20 w-20 rounded-full absolute top-3 left-12'
                      style={{ backgroundColor: !isNight ? '#FFFFFF' : '#A0AEC9' }}
                    />
                  </View>
                </View>
              )}
            </View>
            <View className="flex flex-row items-center gap-2 mt-2">
              <Text className={` ${isNight ? "text-[#eaeeff]" : "text-slate-700"} text-3xl font-semibold mb-4`}>{profile?.name || 'Jean'}</Text>
              <View className='flex flex-row items-center mb-4'>
              <Text className={` ${isNight ? "text-[#eaeeff]" : "text-slate-700"} text-3xl font-semibold`}>{profile?.storyCoin || '0'}</Text>
              <Image
                source={{ uri: "https://res.cloudinary.com/dnotl9a0s/image/upload/v1767644505/ChatGPT_Image_5_janv._2026_21_21_34_saseb4.png" }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 200,
                }}
                className=''
              />
              </View>
            </View>
          </View>
        </View>




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
              icon={<Feather name="plus" size={24} color="#334155" />}
            />
          </View>
          <HomeButton
            isNight={isNight}
            onPress={() => navigation.navigate('SharedStories')}
            title="Découvrir"
            description="Parcourez les histoires partagées par d'autres utilisateus !"
            icon={<Feather name="users" size={24} color="#334155" />}
          />

        </View>
        {isNight && (
          <View
            style={{
              position: 'absolute',
              bottom: 24,
              right: 50,
              zIndex: 100,
            }}
          >
            <LottieView
              source={require('../../assets/animations/sleepyDog.json')}
              autoPlay
              loop={true}
              style={{ width: 150, height: 150 }}
            />
          </View>
        )}
      </View>
    </View>
  );

}
