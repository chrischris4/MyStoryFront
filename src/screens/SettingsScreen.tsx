import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Image, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '~/context/ThemeContext';
import { useAuth } from '~/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useUserStore, isPremiumUser } from '~/store/useUserStore';
import EditProfilModal from '~/components/EditProfilModal';
import { useSound } from '~/context/SoundContext';
import * as Haptics from 'expo-haptics';
import StarryBackground from '~/components/StarryBackground';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { isNight, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isEditProfilModalVisible, setIsEditProfilModalVisible] = useState(false);

    // Hook pour les sons
    const { playSound, isMusicEnabled, toggleBackgroundMusic, areSoundEffectsEnabled, toggleSoundEffects, pauseBackgroundMusic } = useSound();
    const groundColor = isNight ? '#2E313F' : '#38A169';
    const groundBorderColor = isNight ? '#44495D' : '#2F855A';

    // Récupérer les données du store
    const userStore = useUserStore((state) => state.user);
    const isPremium = isPremiumUser(userStore?.subscriptionPlan);

    // Fonction pour obtenir le nom d'affichage du plan
    const getPlanDisplayName = (planType?: string): string => {
        if (!planType) return 'Premium';

        const planNames: { [key: string]: string } = {
            'EXPLOROR': t('plans.explorer'),
            'ADVENTURER': t('plans.adventurer'),
            'LEGEND': t('plans.legend'),
        };

        return planNames[planType] || 'Premium';
    };

    const planName = getPlanDisplayName(userStore?.subscriptionPlan);



    const handleLogout = async () => {
        // Utiliser un modal de confirmation personnalisé ou directement logout
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        playSound('click');
        pauseBackgroundMusic();

        const userName = user?.profil?.name || 'ami';
        await logout();
        navigation.navigate('Login' as never);
        Toast.show({
            type: 'success',
            text1: t('welcome.goodbye', { name: userName }),
            text2: t('welcome.seeYouSoon'),
        });
    };

    const handleBilling = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        playSound('click');
        navigation.navigate('BillingScreen' as never);
    };

    return (
        <View className="relative" style={[styles.container, { backgroundColor: isNight ? '#020205' : '#87CEEB' }]}>
            {isNight && <StarryBackground starCount={50} />}

            {/* Sol */}
            <View
                className='absolute bottom-0 -right-20 border-4 h-36 rounded-t-full w-[100%] z-0'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
            />
            <View
                className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-10'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
            />
            <Text className={`font-baloo-bold text-4xl pt-2 ${isNight ? "text-white" : "text-black"}`}>{t('settings.title')}</Text>

            <ScrollView className='pb-72' showsVerticalScrollIndicator={false}>
                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} className='p-4 rounded-xl overflow-hidden mb-4' style={ { backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} mb-4 text-2xl font-baloo-semibold self-start`}>{t('settings.account')}</Text>
                        <Feather name="user" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    {user && (
                        <View className="flex-row items-center gap-4 mb-4">
                            <Image
                                source={user?.profil?.imageUrl ? { uri: user?.profil.imageUrl } : require('../../assets/default-avatar.png')}
                                style={styles.profileImage}
                            />
                            <View className="flex-1">
                                {user.profil.name && (
                                    <Text className={`${isNight ? "text-white" : "text-slate-800"} text-xl font-baloo-semibold`}>
                                        {user.profil.name}
                                    </Text>
                                )}
                                <Text className={`${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>{user.email}</Text>

                            </View>
                        </View>
                    )}
                    <TouchableOpacity style={styles.button} onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        playSound('pop');
                        setIsEditProfilModalVisible(true);
                    }}>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>{t('settings.editProfile')}</Text>
                        <Feather name="edit" size={20} color={isNight ? "#fff" : "#000"} />
                    </TouchableOpacity>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} className='p-4 rounded-xl overflow-hidden mb-4'  style={{backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start mb-2`}>{t('settings.appearance')}</Text>
                        {!isNight ? (
                            <Feather name="sun" size={20} color={isNight ? "#fff" : "#000"} />
                        ) : (
                            <Feather name="moon" size={20} color={isNight ? "#fff" : "#000"} />
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            playSound('toggle');
                            toggleTheme();
                        }}
                        style={styles.button}
                    >
                        <View className="flex-row items-center justify-center gap-2">
                            <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>
                                {isNight ? t('settings.switchToLight') : t('settings.switchToDark')}
                            </Text>
                            {isNight ? (
                                <Feather name="sun" size={20} color={isNight ? "#fff" : "#000"} />
                            ) : (
                                <Feather name="moon" size={20} color={isNight ? "#fff" : "#000"} />
                            )}

                        </View>
                    </TouchableOpacity>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} className='p-4 rounded-xl overflow-hidden mb-4'  style={{backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start`}>{t('settings.sounds')}</Text>
                        <Feather name="volume-2" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <View className='flex flex-row justify-between items-center mb-3'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo self-start`}>{t('settings.backgroundMusic')}</Text>
                        <Switch
                            value={isMusicEnabled}
                            onValueChange={toggleBackgroundMusic}
                            thumbColor={isMusicEnabled ? '#38A169' : '#ccc'}
                        />
                    </View>
                    <View className='flex flex-row justify-between items-center'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo self-start`}>{t('settings.soundEffects')}</Text>
                        <Switch
                            value={areSoundEffectsEnabled}
                            onValueChange={toggleSoundEffects}
                            thumbColor={areSoundEffectsEnabled ? '#38A169' : '#ccc'}
                        />
                    </View>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} className='p-4 rounded-xl overflow-hidden mb-4'  style={{backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between mb-4'>

                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start`}>{t('settings.notifications')}</Text>
                        <Feather name="bell" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <View className='flex flex-row justify-between items-center'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo self-start`}>{t('settings.enableNotifications')}</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            thumbColor={notificationsEnabled ? '#38A169' : '#ccc'}
                        />
                    </View>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} className='p-4 rounded-xl overflow-hidden mb-4'  style={{backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start`}>{t('settings.history')}</Text>
                        <Feather name="clock" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleBilling}>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>{t('settings.viewPurchases')}</Text>
                    </TouchableOpacity>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} className='p-4 rounded-xl overflow-hidden mb-4'  tint={isNight ? 'dark' : 'light'} style={{backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start`}>{t('settings.subscription')}</Text>
                        <Feather name="credit-card" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>

                    {isPremium ? (
                        <View className="mb-4">
                            <Text className={` ${isNight ? "text-white/70" : "text-slate-500"} text-base font-baloo`}>{t('settings.currentPlan')}</Text>
                                <Text className={` ${isNight ? "text-white" : "text-slate-700"} text-xl font-baloo-semibold`}>
                                    {planName}
                                </Text>
                        </View>
                    ) : (
                        <Text className={` ${isNight ? "text-white/70" : "text-slate-500"} text-lg font-baloo mb-4`}>
                            {t('settings.noSubscription')}
                        </Text>
                    )}

                    <TouchableOpacity style={styles.button} onPress={handleBilling}>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>{t('settings.manageSubscription')}</Text>
                    </TouchableOpacity>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} className='p-4 rounded-xl overflow-hidden mb-4'  style={{backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start`}>{t('settings.contact')}</Text>
                        <Feather name="mail" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <TouchableOpacity
                        style={styles.button}
                        className='mb-3'
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            playSound('click');
                            Linking.openURL('mailto:support@flun.app');
                        }}
                    >
                        <Feather name="mail" size={18} color={isNight ? "#fff" : "#000"} />
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>support@flun.app</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            playSound('click');
                            Linking.openURL('https://flun.app');
                        }}
                    >
                        <Feather name="globe" size={18} color={isNight ? "#fff" : "#000"} />
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>flun.app</Text>
                    </TouchableOpacity>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} style={styles.sectionBis} className='w-11/12 mx-auto'>
                    <TouchableOpacity style={styles.button} onPress={handleLogout}>
                        <Text className={`${isNight ? "text-white" : "text-slate-700"} font-baloo-medium text-xl`}>{t('settings.logout')}</Text>
                    </TouchableOpacity>
                </BlurView>
            </ScrollView>

            <EditProfilModal
                visible={isEditProfilModalVisible}
                onClose={() => setIsEditProfilModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 40,
    },
    section: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        overflow: 'hidden', // indispensable pour le BlurView
    },
    sectionBis: {
        borderRadius: 24,
        marginBottom: 80,
        overflow: 'hidden', // indispensable pour le BlurView
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    button: {
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E2E8F0',
    },

});
