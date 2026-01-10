import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Dimensions, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '~/context/ThemeContext';
import { useAuth } from '~/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import Background from '~/components/Background';
import Toast from 'react-native-toast-message';
import { useUserStore, isPremiumUser } from '~/store/useUserStore';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { isNight, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const skyColor = isNight ? '#020205' : '#87CEEB';
    const cloudColor = isNight ? '#A0AEC2' : '#FFFFFF';
    const groundColor = isNight ? '#2E313F' : '#38A169';
    const groundBorderColor = isNight ? '#44495D' : '#2F855A';

    // Récupérer les données du store
    const userStore = useUserStore((state) => state.user);
    const isPremium = isPremiumUser(userStore?.subscriptionPlan);

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

    const planName = getPlanDisplayName(userStore?.subscriptionPlan);



    const handleLogout = async () => {
        // Utiliser un modal de confirmation personnalisé ou directement logout
        const userName = user?.profil?.name || 'ami';
        await logout();
        navigation.navigate('Login' as never);
        Toast.show({
            type: 'success',
            text1: `À bientôt ${userName} !`,
            text2: 'On espère te revoir bientôt !',
        });
    };

    const handleBilling = () => {
        navigation.navigate('BillingScreen' as never);
    };

    const renderStars = (count: number) => {
        const stars = [];
        const { width, height } = Dimensions.get('window');

        for (let i = 0; i < count; i++) {
            const size = Math.random() * 2 + 1; // taille entre 1 et 3
            const top = Math.random() * (height * 0.5); // moitié supérieure de l'écran
            const left = Math.random() * width;
            const opacity = Math.random() * 0.8 + 0.2; // variation d'opacité

            stars.push(
                <View
                    key={`star-${i}`}
                    style={{
                        position: 'absolute',
                        top,
                        left,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: '#FFFFFF',
                        opacity,
                    }}
                />
            );
        }

        return stars;
    };

    return (
        <View className="relative" style={[styles.container, { backgroundColor: isNight ? '#020205' : '#87CEEB' }]}>
            {isNight && renderStars(50)}

            {/* Sol */}
            <View
                className='absolute bottom-0 -right-20 border-4 h-36 rounded-t-full w-[100%] z-0'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
            />
            <View
                className='absolute bottom-0 -left-10 border-t-4 h-[75px] w-[200%] z-10'
                style={{ backgroundColor: groundColor, borderColor: groundBorderColor }}
            />
            <Text className={`font-baloo-bold text-4xl pt-4 ${isNight ? "text-white" : "text-black"}`}>Paramètres</Text>

            <ScrollView className='pb-72' showsVerticalScrollIndicator={false}>
                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} className='p-4 rounded-xl overflow-hidden mb-4' style={ { backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} mb-4 text-2xl font-baloo-semibold self-start`}>Compte</Text>
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
                    <TouchableOpacity style={styles.button} onPress={handleBilling}>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>Modifier votre profil</Text>
                        <Feather name="edit" size={20} color={isNight ? "#fff" : "#000"} />
                    </TouchableOpacity>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} className='p-4 rounded-xl overflow-hidden mb-4'  style={{backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start mb-2`}>Apparence</Text>
                        {!isNight ? (
                            <Feather name="sun" size={20} color={isNight ? "#fff" : "#000"} />
                        ) : (
                            <Feather name="moon" size={20} color={isNight ? "#fff" : "#000"} />
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={styles.button}
                    >
                        <View className="flex-row items-center justify-center gap-2">
                            <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>
                                Passer en mode {isNight ? 'clair' : 'sombre'}
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

                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start`}>Notifications</Text>
                        <Feather name="bell" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <View className='flex flex-row justify-between items-center'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo self-start`}>Activer les notifications</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            thumbColor={notificationsEnabled ? '#38A169' : '#ccc'}
                        />
                    </View>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} className='p-4 rounded-xl overflow-hidden mb-4'  style={{backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start`}>Historique</Text>
                        <Feather name="clock" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleBilling}>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>Consulter vos achats</Text>
                    </TouchableOpacity>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} className='p-4 rounded-xl overflow-hidden mb-4'  tint={isNight ? 'dark' : 'light'} style={{backgroundColor: isNight ? '#1e293b90' : '' }}>
                    <View className='flex flex-row justify-between mb-4'>
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start`}>Abonnement</Text>
                        <Feather name="credit-card" size={20} color={isNight ? "#fff" : "#000"} />
                    </View>

                    {isPremium ? (
                        <View className="mb-4">
                            <Text className={` ${isNight ? "text-white/70" : "text-slate-500"} text-base font-baloo`}>Plan actuel</Text>
                                <Text className={` ${isNight ? "text-white" : "text-slate-700"} text-xl font-baloo-semibold`}>
                                    {planName}
                                </Text>
                        </View>
                    ) : (
                        <Text className={` ${isNight ? "text-white/70" : "text-slate-500"} text-base font-baloo mb-4`}>
                            Vous n'avez pas d'abonnement actif
                        </Text>
                    )}

                    <TouchableOpacity style={styles.button} onPress={handleBilling}>
                        <Text className={` ${isNight ? "text-white" : "text-slate-600"} text-lg font-baloo`}>Gérer mon abonnement</Text>
                    </TouchableOpacity>
                </BlurView>

                <BlurView intensity={isNight ? 90 : 50} tint={isNight ? 'dark' : 'light'} style={styles.sectionBis}>
                    <TouchableOpacity style={styles.button} onPress={handleLogout}>
                        <Text className={`${isNight ? "text-white" : "text-slate-700"} font-baloo-medium text-xl`}>Se déconnecter</Text>
                    </TouchableOpacity>
                </BlurView>
            </ScrollView>
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
