import { View, Text, Image, TouchableOpacity } from 'react-native';
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
import { useTranslation } from 'react-i18next';
import { useSound } from '~/context/SoundContext';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isNight } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { playBackgroundMusic, toggleBackgroundMusic, isMusicEnabled } = useSound();

  // Lancer la musique au premier rendu
  useEffect(() => {
    playBackgroundMusic();
  }, []);

  // Récupérer les données depuis Zustand au lieu de faire un fetch
  const user = useUserStore((state) => state.user);
  const profile = {
    name: user?.profil.name || t('home.defaultName'),
    isPremium: isPremiumUser(user?.subscriptionPlan),
    imageUrl: user?.profil.imageUrl,
    storyCoin: user?.storyCoin || 0,
  };

  // Fonction pour obtenir le nom d'affichage du plan
  const getPlanDisplayName = (planType?: string): string => {
    if (!planType) return t('plans.explorer');

    const planNames: { [key: string]: string } = {
      'EXPLOROR': t('plans.explorer'),
      'ADVENTURER': t('plans.adventurer'),
      'LEGEND': t('plans.legend'),
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
          {/* Bouton musique en haut à droite */}
          <TouchableOpacity
            onPress={toggleBackgroundMusic}
            className="absolute right-0 top-0 z-10"
          >
            <BlurView
              intensity={isNight ? 90 : 50}
              tint={isNight ? 'dark' : 'light'}
              className="p-3 rounded-full overflow-hidden"
              style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
            >
              <Feather
                name={isMusicEnabled ? 'volume-2' : 'volume-x'}
                size={24}
                color={isNight ? '#ffffff' : '#334155'}
              />
            </BlurView>
          </TouchableOpacity>

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
                  borderWidth: 6,
                  borderColor: isNight ? '#FFFFFF' : '#FACC15',
                }}
                className='absolute bottom-0 left-0'
              />

            </View>

          </View>
        </View>
        <Text className={` ${isNight ? "text-[#eaeeff]" : "text-black"} text-3xl font-baloo-semibold mt-2`}>{profile?.name || 'Jean'}</Text>

        <View className='flex-row items-center gap-4 self-center mb-4'>
          {profile.isPremium && (
            <View>
              <BlurView
                intensity={isNight ? 90 : 50}
                tint={isNight ? "dark" : "light"}
                className="py-2 px-4 rounded-2xl overflow-hidden"
                style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
              >
                <Text className={`${isNight ? "text-white" : "text-slate-700"} text-lg text-center font-baloo-semibold`}>
                  {planName}
                </Text>
              </BlurView>
            </View>
          )}
          <View>
            <BlurView
              intensity={isNight ? 90 : 50}
              tint={isNight ? "dark" : "light"}
              className="py-2 px-4 rounded-2xl overflow-hidden"
              style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
            >
              <Text className={`${isNight ? "text-white" : "text-slate-700"} text-lg text-center font-baloo-semibold`}>
                {profile?.storyCoin || '0'} {t('home.tokens')}
              </Text>
            </BlurView>
          </View>
        </View>


        <View className="flex flex-col gap-4 w-11/12">
          <View className='flex-row gap-4'>
            <HomeButton
              style="half"
              isNight={isNight}
              onPress={() => navigation.navigate('Stories')}
              title={t('home.myStories')}
              description={t('home.myStoriesDesc')}
              icon={<Feather name="book" size={24} color="#334155" />}
            />
            <HomeButton
              style="half"

              isNight={isNight}
              onPress={() => navigation.navigate('GroupScreen')}
              title={t('home.myGroups')}
              description={t('home.myGroupsDesc')}
              icon={<Feather name="plus" size={24} color="#334155" />}
            />
          </View>
          <View className='flex-row gap-4'>
            <HomeButton
              style="half"

              isNight={isNight}
              onPress={() => navigation.navigate('SharedStories')}
              title={t('home.discover')}
              description={t('home.discoverDesc')}
              icon={<Feather name="users" size={24} color="#334155" />}
            />
            <HomeButton
              style="half"

              isNight={isNight}
              onPress={() => navigation.navigate('BillingScreen')}
              title={t('home.shop')}
              description={t('home.shopDesc')}
              icon={<Feather name="home" size={24} color="#334155" />}
            />
          </View>
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
