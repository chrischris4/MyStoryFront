import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Image, Linking, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PlatformBlur from '~/components/PlatformBlur';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '~/context/ThemeContext';
import { useAuth } from '~/context/AuthContext';
import { Feather, FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useUserStore, isPremiumUser } from '~/store/useUserStore';
import EditProfilModal from '~/components/EditProfilModal';
import { useSound } from '~/context/SoundContext';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import i18n, { setLanguage } from '~/i18n';
import { useTransactionsByUser, type Transaction } from '~/hooks/useTransactionsByUser';
import { useDeleteAccount } from '~/hooks/useDeleteAccount';
import LottieView from 'lottie-react-native';
import Background from '~/components/Background';

export default function SettingsScreen() {
    const { t } = useTranslation();
    const { bottom: bottomInset } = useSafeAreaInsets();
    const navigation = useNavigation();
    const { isNight, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isEditProfilModalVisible, setIsEditProfilModalVisible] = useState(false);
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
    const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] = useState(false);
    const { data: transactions = [], isLoading: isLoadingTransactions, error: transactionsError } = useTransactionsByUser(isHistoryModalVisible);
    const deleteAccountMutation = useDeleteAccount();
    const { playSound, isMusicEnabled, toggleBackgroundMusic, areSoundEffectsEnabled, toggleSoundEffects, pauseBackgroundMusic } = useSound();
    const groundColor = isNight ? '#2E313F' : '#38A169';
    const groundBorderColor = isNight ? '#44495D' : '#2F855A';
    const userStore = useUserStore((state) => state.user);
    const isPremium = isPremiumUser(userStore?.subscriptionPlan);
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        playSound('click');
        pauseBackgroundMusic();

        const userName = user?.profil?.name || 'ami';
        await logout();
        navigation.navigate('Login' as never);
        Toast.show({
            type: 'info',
            text1: t('welcome.goodbye', { name: userName }),
            text2: t('welcome.seeYouSoon'),
            props: { emoji: '👋' },
        });
    };
    const handleBilling = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        playSound('click');
        navigation.navigate('BillingScreen' as never);
    };

    return (
        <View className="relative" style={[styles.container, { backgroundColor: isNight ? '#020205' : '#87CEEB' }]}>
            <View
                className='absolute bottom-0 -right-52 border-4 h-36 rounded-t-full w-[100%] z-10'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor, bottom: bottomInset }}
            />
            <Background isNight={isNight} />
            <Text className={`font-baloo-bold mb-2 text-4xl md:text-5xl pt-2 px-4 md:px-8 md:pb-2 ${isNight ? "text-white" : "text-black"}`}>{t('settings.title')}</Text>
            <ScrollView className='px-4 md:px-8 z-10' showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 + bottomInset }}>
                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} className='p-4 rounded-3xl overflow-hidden mb-4' style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} mb-4 text-2xl md:text-3xl font-baloo-semibold self-start`}>{t('settings.account')}</Text>
                        <Feather name="user" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    {user && (
                        <View className="flex-row items-center gap-4 mb-4">
                            <Image
                                source={user?.profil?.imageUrl ? { uri: user?.profil.imageUrl } : require('../../assets/default-avatar.png')}
                                className='w-20 md:w-24 h-20 md:h-24 rounded-full bg-[#E2E8F0]'
                            />
                            <View className="flex-1">
                                {user?.profil?.name && (
                                    <Text className={`${isNight ? "text-white" : "text-slate-800"} text-xl font-baloo-semibold`}>
                                        {user.profil.name}
                                    </Text>
                                )}
                                <Text className={`${isNight ? "text-white/80" : "text-slate-500"} text-lg font-baloo`}>{user.email}</Text>
                            </View>
                        </View>
                    )}
                    <TouchableOpacity activeOpacity={0.8} style={[styles.button, { backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }]} onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        playSound('pop');
                        setIsEditProfilModalVisible(true);
                    }}>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>{t('settings.editProfile')}</Text>
                        <Feather name="edit" size={20} color={isNight ? "#fff" : "#000"} />
                    </TouchableOpacity>
                </PlatformBlur>
                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} className='p-4 rounded-3xl overflow-hidden mb-4' style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start mb-2`}>{t('settings.appearance')}</Text>
                        {!isNight ? (
                            <Feather name="sun" size={20} color={isNight ? "#fff" : "#000"} />
                        ) : (
                            <Feather name="moon" size={20} color={isNight ? "#fff" : "#000"} />
                        )}
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            playSound('toggle');
                            toggleTheme();
                        }}
                        style={[styles.button, { backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }]}
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
                </PlatformBlur>
                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} className='p-4 rounded-3xl overflow-hidden mb-4' style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={`${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start`}>{t('settings.language')}</Text>
                        <Feather name="globe" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <View className='flex-row gap-3'>
                        {(['fr', 'en'] as const).map((lang) => {
                            const isSelected = i18n.language === lang;
                            return (
                                <TouchableOpacity
                                    key={lang}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        playSound('click');
                                        setLanguage(lang);
                                    }}
                                    className='flex-1 py-3 rounded-xl items-center'
                                    style={{ backgroundColor: isSelected ? '#38b6ff' : isNight ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)' }}
                                >
                                    <Text className={`font-baloo-semibold text-lg ${isSelected ? 'text-white' : isNight ? 'text-white' : 'text-slate-600'}`}>
                                        {lang === 'fr' ? '🇫🇷  Français' : '🇬🇧  English'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </PlatformBlur>
                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} className='p-4 rounded-3xl overflow-hidden mb-4' style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start`}>{t('settings.sounds')}</Text>
                        <Feather name="volume-2" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <View className='flex flex-row justify-between items-center mb-3'>
                        <Text className={` ${isNight ? "text-white/80" : "text-slate-500"} text-lg font-baloo self-start`}>{t('settings.backgroundMusic')}</Text>
                        <Switch
                            value={isMusicEnabled}
                            onValueChange={toggleBackgroundMusic}
                            thumbColor={isMusicEnabled ? '#38A169' : '#ccc'}
                        />
                    </View>
                    <View className='flex flex-row justify-between items-center'>
                        <Text className={` ${isNight ? "text-white/80" : "text-slate-500"} text-lg font-baloo self-start`}>{t('settings.soundEffects')}</Text>
                        <Switch
                            value={areSoundEffectsEnabled}
                            onValueChange={toggleSoundEffects}
                            thumbColor={areSoundEffectsEnabled ? '#38A169' : '#ccc'}
                        />
                    </View>
                </PlatformBlur>
                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} className='p-4 rounded-3xl overflow-hidden mb-4' style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between mb-4'>

                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start`}>{t('settings.notifications')}</Text>
                        <Feather name="bell" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <View className='flex flex-row justify-between items-center'>
                        <Text className={` ${isNight ? "text-white/80" : "text-slate-500"} text-lg font-baloo self-start`}>{t('settings.enableNotifications')}</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            thumbColor={notificationsEnabled ? '#38A169' : '#ccc'}
                        />
                    </View>
                </PlatformBlur>
                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} className='p-4 rounded-3xl overflow-hidden mb-4' style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start`}>{t('settings.history')}</Text>
                        <Feather name="clock" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.button, { backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            playSound('pop');
                            setIsHistoryModalVisible(true);
                        }}
                    >
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>{t('settings.viewPurchases')}</Text>
                    </TouchableOpacity>
                </PlatformBlur>
                <PlatformBlur intensity={90}
                    className='p-4 rounded-3xl overflow-hidden mb-4' tint={isNight ? 'dark' : 'light'} style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start`}>{t('settings.subscription')}</Text>
                        <Feather name="credit-card" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>

                    {isPremium ? (
                        <View className="mb-4">
                            <Text className={` ${isNight ? "text-white/80" : "text-slate-500"} text-base font-baloo`}>{t('settings.currentPlan')}</Text>
                            <Text className={` ${isNight ? "text-white" : "text-slate-700"} text-xl font-baloo-semibold`}>
                                {planName}
                            </Text>
                        </View>
                    ) : (
                        <Text className={` ${isNight ? "text-white/80" : "text-slate-500"} text-lg font-baloo mb-4`}>
                            {t('settings.noSubscription')}
                        </Text>
                    )}
                    <TouchableOpacity activeOpacity={0.8}
                        style={[styles.button, { backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }]} onPress={handleBilling}>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>{t('settings.manageSubscription')}</Text>
                    </TouchableOpacity>
                </PlatformBlur>
                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} className='p-4 rounded-3xl overflow-hidden mb-4' style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start`}>{t('settings.contact')}</Text>
                        <Feather name="mail" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.button, { backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            playSound('click');
                            Linking.openURL('mailto:contact.flun@gmail.com');
                        }}
                    >
                        <Feather name="mail" size={18} color={isNight ? "#fff" : "#000"} />
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>support@flun.app</Text>
                    </TouchableOpacity>
                </PlatformBlur>

                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} className='p-4 rounded-3xl overflow-hidden mb-4' style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start`}>{t('settings.followUs')}</Text>
                        <Feather name="heart" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <View className='flex flex-row justify-center gap-4'>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className='items-center justify-center rounded-2xl'
                            style={{ width: 56, height: 56, backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                playSound('click');
                                Linking.openURL('https://instagram.com/flun.app');
                            }}
                        >
                            <FontAwesome name="instagram" size={28} color={isNight ? "#fff" : "#000"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className='items-center justify-center rounded-2xl'
                            style={{ width: 56, height: 56, backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                playSound('click');
                                Linking.openURL('https://x.com/flunapp');
                            }}
                        >
                            <FontAwesome name="twitter" size={28} color={isNight ? "#fff" : "#000"} />
                        </TouchableOpacity>
                    </View>
                </PlatformBlur>
                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} className='p-4 rounded-3xl overflow-hidden mb-4' style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start`}>{t('settings.legal')}</Text>
                        <Feather name="book-open" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.button, { backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }]}
                        className='mb-3'
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            playSound('click');
                            Linking.openURL('https://sites.google.com/view/flunprivacypolicy/privacy-policy');
                        }}
                    >
                        <Feather name="shield" size={18} color={isNight ? "#fff" : "#000"} />
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>{t('settings.privacyPolicy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.button, { backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            playSound('click');
                            Linking.openURL('https://sites.google.com/view/flunprivacypolicy/terms-of-services');
                        }}
                    >
                        <Feather name="file-text" size={18} color={isNight ? "#fff" : "#000"} />
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>{t('settings.termsOfService')}</Text>
                    </TouchableOpacity>
                </PlatformBlur>
                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} className='p-4 rounded-3xl overflow-hidden mb-4' style={{ backgroundColor: isNight ? '#1e293b90' : '#38b6ff10' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start`}>{t('settings.deleteAccount')}</Text>
                        <Feather name="trash-2" size={20} color="#ef4444" />
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.button, { backgroundColor: isNight ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.2)' }]}
                        onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            playSound('click');
                            setIsDeleteAccountModalVisible(true);
                        }}
                    >
                        <Feather name="trash-2" size={18} color="#ef4444" />
                        <Text className="text-red-500 text-lg font-baloo">{t('settings.deleteAccountButton')}</Text>
                    </TouchableOpacity>
                </PlatformBlur>
                <PlatformBlur intensity={90}
                    tint={isNight ? 'dark' : 'light'} style={styles.sectionBis} className='w-11/12 mx-auto'>
                    <TouchableOpacity activeOpacity={0.8} style={[styles.button, { backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }]} onPress={handleLogout}>
                        <Text className={`${isNight ? "text-white" : "text-slate-700"} font-baloo-medium text-xl`}>{t('settings.logout')}</Text>
                    </TouchableOpacity>
                </PlatformBlur>
            </ScrollView>

            {/* Modal Edit Profile */}
            <EditProfilModal
                visible={isEditProfilModalVisible}
                onClose={() => setIsEditProfilModalVisible(false)}
            />

            {/* Modal Historique des transactions */}
            <Modal
                visible={isHistoryModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsHistoryModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <PlatformBlur
                        intensity={90}
                        tint={isNight ? "dark" : "light"}
                        className="rounded-3xl w-full max-w-lg overflow-hidden"
                        style={{ backgroundColor: isNight ? '#1e293b' : '#ffffff', maxHeight: '80%' }}
                    >
                        {/* Header */}
                        <View className={`${isNight ? 'bg-slate-900' : 'bg-[#0D1821]'} p-6`}>
                            <Text className="text-white text-2xl font-baloo-bold text-center">
                                {t('transactions.title')}
                            </Text>
                        </View>

                        {/* Content */}
                        <View className="p-4" style={{ maxHeight: 400 }}>
                            {isLoadingTransactions ? (
                                <View className="items-center justify-center py-8">
                                    <LottieView
                                        source={require('../../assets/animations/LoadingWhite.json')}
                                        autoPlay
                                        loop={true}
                                        style={{ width: 100, height: 100 }}
                                    />
                                    <Text className={`${isNight ? 'text-white/70' : 'text-gray-500'} font-baloo mt-4`}>
                                        {t('common.loading')}
                                    </Text>
                                </View>
                            ) : transactionsError ? (
                                <View className="items-center justify-center py-8">
                                    <Feather name="alert-circle" size={48} color={isNight ? '#ef4444' : '#dc2626'} />
                                    <Text className={`${isNight ? 'text-white/70' : 'text-gray-500'} font-baloo mt-4 text-center`}>
                                        {t('transactions.loadError')}
                                    </Text>
                                </View>
                            ) : transactions.length === 0 ? (
                                <View className="items-center justify-center py-8">
                                    <Feather name="shopping-bag" size={48} color={isNight ? '#64748b' : '#94a3b8'} />
                                    <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg mt-4`}>
                                        {t('transactions.noTransactions')}
                                    </Text>
                                    <Text className={`${isNight ? 'text-white/70' : 'text-gray-500'} font-baloo text-center mt-2`}>
                                        {t('transactions.noTransactionsMessage')}
                                    </Text>
                                </View>
                            ) : (
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                                    {transactions.map((transaction: Transaction) => (
                                        <View
                                            key={transaction.id}
                                            className={`${isNight ? 'bg-slate-700' : 'bg-gray-100'} rounded-xl p-4 mb-3`}
                                        >
                                            <View className="flex-row justify-between items-start">
                                                <View className="flex-1">
                                                    <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-base`}>
                                                        {transaction.subscription
                                                            ? `${t('transactions.subscription')} - ${transaction.subscription.plan.name}`
                                                            : transaction.product
                                                                ? `${t('transactions.tokenPack')} - ${t('transactions.tokens', { count: transaction.product.coins })}`
                                                                : 'Achat'
                                                        }
                                                    </Text>
                                                    <Text className={`${isNight ? 'text-white/60' : 'text-gray-500'} font-baloo text-sm mt-1`}>
                                                        {new Date(transaction.purchaseDate).toLocaleDateString('fr-FR', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </Text>
                                                </View>
                                                <View className="items-end">
                                                    <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-bold text-lg`}>
                                                        {transaction.amount.toFixed(2)} {transaction.currency}
                                                    </Text>
                                                    <View className={`mt-1 px-2 py-1 rounded-full ${transaction.status === 'COMPLETED' ? 'bg-green-500/20' :
                                                        transaction.status === 'PENDING' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                                                        }`}>
                                                        <Text className={`text-xs font-baloo-medium ${transaction.status === 'COMPLETED' ? 'text-green-600' :
                                                            transaction.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>
                                                            {transaction.status === 'COMPLETED' ? t('transactions.completed') :
                                                                transaction.status === 'PENDING' ? t('transactions.pending') : t('transactions.failed')}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </View>

                        {/* Actions */}
                        <View className="p-4 pt-0">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className={`${isNight ? 'bg-slate-700' : 'bg-gray-200'} px-6 py-4 rounded-xl items-center`}
                                onPress={() => setIsHistoryModalVisible(false)}
                            >
                                <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}>
                                    {t('common.close')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </PlatformBlur>
                </View>
            </Modal>

            {/* Modal Confirmation suppression de compte */}
            <Modal
                visible={isDeleteAccountModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDeleteAccountModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <PlatformBlur
                        intensity={90}
                        tint={isNight ? "dark" : "light"}
                        className="rounded-3xl w-full max-w-lg overflow-hidden"
                        style={{ backgroundColor: isNight ? '#1e293b' : '#ffffff' }}
                    >
                        {/* Header */}
                        <View className="bg-red-500 p-6">
                            <Feather name="alert-triangle" size={48} color="#fff" style={{ alignSelf: 'center', marginBottom: 12 }} />
                            <Text className="text-white text-2xl md:text-3xl font-baloo-bold text-center">
                                {t('settings.deleteAccountTitle')}
                            </Text>
                        </View>

                        {/* Content */}
                        <View className="p-6">
                            <Text className={`${isNight ? 'text-white/80' : 'text-gray-600'} font-baloo text-base text-center mb-4`}>
                                {t('settings.deleteAccountWarning')}
                            </Text>
                            <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg text-center`}>
                                {t('settings.deleteAccountConfirm')}
                            </Text>
                        </View>

                        {/* Actions */}
                        <View className="p-4 pt-0 flex-row gap-3">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className={`flex-1 ${isNight ? 'bg-slate-700' : 'bg-gray-200'} px-6 py-4 rounded-xl items-center`}
                                onPress={() => {
                                    playSound('click');
                                    setIsDeleteAccountModalVisible(false);
                                }}
                            >
                                <Text className={`${isNight ? 'text-white' : 'text-gray-800'} font-baloo-semibold text-lg`}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className="flex-1 bg-red-500 px-6 py-4 rounded-xl items-center"
                                disabled={deleteAccountMutation.isPending}
                                onPress={async () => {
                                    if (!user?.id) return;
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                                    playSound('click');

                                    try {
                                        await deleteAccountMutation.mutateAsync(user.id);
                                        setIsDeleteAccountModalVisible(false);
                                        pauseBackgroundMusic();
                                        await logout();
                                        navigation.navigate('Login' as never);
                                        Toast.show({
                                            type: 'success',
                                            text1: t('settings.accountDeleted'),
                                            text2: t('settings.accountDeletedMessage'),
                                            props: { emoji: '🗑️' },
                                        });
                                    } catch (error) {
                                        Toast.show({
                                            type: 'error',
                                            text1: t('errors.unknownError'),
                                        });
                                    }
                                }}
                            >
                                {deleteAccountMutation.isPending ? (
                                    <LottieView
                                        source={require('../../assets/animations/LoadingWhite.json')}
                                        autoPlay
                                        loop={true}
                                        style={{ width: 100, height: 100 }}
                                    />
                                ) : (
                                    <Text className="text-white font-baloo-semibold text-lg">
                                        {t('common.confirm')}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </PlatformBlur>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    section: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    sectionBis: {
        borderRadius: 24,
        marginBottom: 80,
        overflow: 'hidden',
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

});
