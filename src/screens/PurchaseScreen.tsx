import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '~/navigation/BottomNavBar';
import ShopButton from '~/components/ShopButton';

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
        <>
            <View className='flex-1 w-11/12 mx-auto'>
                <Text className="text-2xl font-bold pt-4">Boutique</Text>
                <Text className="text-base font-light pb-4">Ici, toutes vos idées prennent vie !</Text>

                <View className='flex flex-row gap-2'>
                    <ShopButton title='10 Jetons' price='10€' onPress={handleBuyTokens} />
                    <ShopButton title='10 Jetons' price='10€' onPress={handleBuyTokens} />
                    <ShopButton title='10 Jetons' price='10€' onPress={handleBuyTokens} />
                </View>

                <View className='flex flex-row gap-2'>
                    <ShopButton title='10 Jetons' price='10€' onPress={handleSubscribe} />
                    <ShopButton title='10 Jetons' price='10€' onPress={handleSubscribe} />
                    <ShopButton title='10 Jetons' price='10€' onPress={handleSubscribe} />
                </View>
            </View>
            <View className='bg-blue-300 rounded-lg p-4 w-1/2 flex items-center'>
                <Text className='w-fit font-bold'>10 Jetons</Text>
                <Text className='w-fit'>10€</Text>

                <Button title="Acheter" onPress={handleBuyTokens} disabled={loading} />
            </View>
            <BottomNavBar />
        </>

    );
}
