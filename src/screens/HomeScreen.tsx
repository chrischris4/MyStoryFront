import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import HomeButton from '~/components/HomeButton';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '~/navigation/AppNavigator';
import Background from '~/components/Background';
import { useTheme } from '~/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { useUserStore, isPremiumUser } from '~/store/useUserStore';
import { BlurView } from 'expo-blur';

export default function HomeScreen() {
  const { isNight } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  // Récupérer les données depuis Zustand au lieu de faire un fetch
  const user = useUserStore((state) => state.user);
  const profile = {
    name: user?.profil.name || 'Prénom',
    isPremium: isPremiumUser(user?.subscriptionPlan),
    imageUrl: user?.profil.imageUrl,
    storyCoin: user?.storyCoin || 0,
  };

  // Fonction pour obtenir le nom d'affichage du plan
  const getPlanDisplayName = (planType?: string): string => {
    if (!planType) return 'Premium';

    const planNames: { [key: string]: string } = {
      'EXPLOROR': 'Explorateur',
      'ADVENTURER': 'Aventurier',
      'LEGEND': 'Légende',
    };

    return planNames[planType] || 'Premium';
  };

  const planName = getPlanDisplayName(user?.subscriptionPlan);

  // Debug: log subscription plan
  // console.log('🎯 User subscriptionPlan:', user?.subscriptionPlan);
  // console.log('💎 isPremium:', profile.isPremium);
  // console.log('📛 planName:', planName);

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

            </View>

          </View>
        </View>

        <View className="flex flex-col w-11/12 items-center mt-2 mb-4">
          <Text className={` ${isNight ? "text-[#eaeeff]" : "text-black"} text-3xl font-baloo-semibold`}>{profile?.name || 'Jean'}</Text>
          <View className='flex-row items-center w-full gap-4 justify-center'>
            {profile.isPremium && (
              <View style={{ flex: 1 }}>
                <BlurView
                  intensity={isNight ? 90 : 50}
                  tint={isNight ? "dark" : "light"}
                  className="py-2 rounded-2xl overflow-hidden"
                  style={{ backgroundColor: isNight ? '#1e293b90' : '#ffffff90' }}
                >
                  <Text className={`${isNight ? "text-white" : "text-slate-700"} text-lg text-center font-baloo-semibold`}>
                    {planName}
                  </Text>
                </BlurView>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <BlurView
                intensity={isNight ? 90 : 50}
                tint={isNight ? "dark" : "light"}
                className="py-2 rounded-2xl overflow-hidden"
                style={{ backgroundColor: isNight ? '#1e293b90' : '#ffffff90' }}
              >
                <Text className={`${isNight ? "text-white" : "text-slate-700"} text-lg text-center font-baloo-semibold`}>
                  {profile?.storyCoin || '0'} Jetons
                </Text>
              </BlurView>
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
            description="Parcourez les histoires partagées par les autres utilisateurs !"
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
