import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Switch, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '~/navigation/BottomNavBar';
import { useTheme } from '~/context/ThemeContext';
import Background from '~/components/Background';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { isNight, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const skyColor = isNight ? '#020205' : '#87CEEB';
    const cloudColor = isNight ? '#A0AEC2' : '#FFFFFF';
    const groundColor = isNight ? '#2E313F' : '#38A169';
    const groundBorderColor = isNight ? '#44495D' : '#2F855A';



    const handleLogout = () => {
        Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Oui', onPress: () => console.log('Déconnexion…') },
        ]);
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
            <Text style={styles.title}>⚙️ Paramètres</Text>

            <BlurView intensity={50} tint={isNight ? 'dark' : 'light'} style={styles.section}>
                <Text style={styles.sectionTitle}>Compte</Text>
                <TouchableOpacity style={styles.button} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Se déconnecter</Text>
                </TouchableOpacity>
            </BlurView>

            <BlurView intensity={50} tint={isNight ? 'dark' : 'light'} style={styles.section}>
                <Text style={styles.sectionTitle}>Apparence</Text>
                <TouchableOpacity style={styles.button} onPress={toggleTheme}>
                    <Text style={styles.buttonText}>
                        Passer en mode {isNight ? 'clair' : 'sombre'}
                    </Text>
                </TouchableOpacity>
            </BlurView>

            <BlurView intensity={50} tint={isNight ? 'dark' : 'light'} style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.row}>
                    <Text style={styles.buttonText}>Activer les notifications</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        thumbColor={notificationsEnabled ? '#38A169' : '#ccc'}
                    />
                </View>
            </BlurView>

            <BlurView intensity={50} tint={isNight ? 'dark' : 'light'} style={styles.section}>
                <Text style={styles.sectionTitle}>Facturation</Text>
                <TouchableOpacity style={styles.button} onPress={handleBilling}>
                    <Text style={styles.buttonText}>Gérer mes achats</Text>
                </TouchableOpacity>
            </BlurView>

            <BottomNavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff',
    },
    section: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        overflow: 'hidden', // indispensable pour le BlurView
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: '#edb4cb',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A202C',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
