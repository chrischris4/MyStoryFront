import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '~/navigation/BottomNavBar';

export default function PurchaseScreen() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);

    const handleBuyTokens = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('Erreur', 'Utilisateur non connecté.');
                return;
            }

            const res = await fetch('https://ton-backend/api/payments/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: 199 }), // en centimes (1.99€)
            });

            const { clientSecret } = await res.json();

            const initResult = await initPaymentSheet({
                paymentIntentClientSecret: clientSecret,
            });

            if (initResult.error) {
                Alert.alert('Erreur', initResult.error.message);
                return;
            }

            const paymentResult = await presentPaymentSheet();

            if (paymentResult.error) {
                Alert.alert('Paiement échoué', paymentResult.error.message);
            } else {
                Alert.alert('Succès', 'Paiement réussi 🎉');
                // 🎯 Ajoute ici les tokens à l’utilisateur
            }
        } catch (error: any) {
            console.error('Erreur paiement:', error);
            Alert.alert('Erreur', error.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = () => {
        Alert.alert('Abonnement', 'Fonction à venir 🔒');
        // 👉 Tu pourras appeler une route backend pour créer une subscription Stripe
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>💎 Boutique</Text>

            <View style={styles.item}>
                <Text>100 tokens - 1,99€</Text>
                <Button title="Acheter" onPress={handleBuyTokens} disabled={loading} />
            </View>

            <View style={styles.item}>
                <Text>Premium - 5,99€/mois</Text>
                <Button title="S’abonner" onPress={handleSubscribe} />
            </View>
            <BottomNavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    item: {
        marginBottom: 32,
    },
});
