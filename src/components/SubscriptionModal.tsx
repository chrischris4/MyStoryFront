import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

type SubscriptionModalProps = {
    visible: boolean;
    onClose: () => void;
    planName: string;
    planFeatures: string[];
    monthlyPrice: string;
    yearlyPrice: string;
    onSelectMonthly: () => void;
    onSelectYearly: () => void;
    isNight: boolean;
};

export default function SubscriptionModal({
    visible,
    onClose,
    planName,
    planFeatures,
    monthlyPrice,
    yearlyPrice,
    onSelectMonthly,
    onSelectYearly,
    isNight,
}: SubscriptionModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-black/50 justify-center items-center px-4"
                onPress={onClose}
            >
                <Animated.View
                    entering={SlideInDown.duration(300)}
                    exiting={SlideOutDown.duration(300)}
                    className="w-full max-w-md"
                    onStartShouldSetResponder={() => true}
                >
                    <BlurView
                        intensity={90}
                        tint={isNight ? "dark" : "light"}
                        className="rounded-3xl overflow-hidden"
                        style={{ backgroundColor: isNight ? '#1e293b90' : '#ffffff90' }}
                    >
                        <View className="p-6">
                            {/* Header */}
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className={`text-3xl font-baloo-bold ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                    {planName}
                                </Text>
                                <TouchableOpacity onPress={onClose} className="p-2 -mt-3">
                                    <Feather name="x" size={24} color={isNight ? '#ffffff' : '#1e293b'} />
                                </TouchableOpacity>
                            </View>

                            {/* Features */}
                            <View className="mb-6">
                                <Text className={`text-lg font-baloo-semibold mb-2 ${isNight ? 'text-white' : 'text-slate-700'}`}>
                                    {t('subscription.included')}
                                </Text>
                                {planFeatures.map((feature, index) => (
                                    <View key={index} className="flex-row items-center mb-2">
                                        <Feather
                                            name="check-circle"
                                            size={20}
                                            color={isNight ? '#4ade80' : '#22c55e'}
                                        />
                                        <Text className={`ml-2 text-base font-baloo ${isNight ? 'text-white/80' : 'text-slate-600'}`}>
                                            {feature}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Payment Options */}
                            <View className="gap-3">
                                {/* Monthly Option */}
                                <TouchableOpacity
                                    onPress={onSelectMonthly}
                                    className="rounded-2xl overflow-hidden"
                                >
                                    <BlurView
                                        intensity={90}
                                        tint={isNight ? "dark" : "light"}
                                        className="p-4"
                                        style={{ backgroundColor: isNight ? '#334155' : '#e2e8f0' }}
                                    >
                                        <View className="flex-row justify-between items-center pt-1">
                                            <View>
                                                <Text className={`text-xl font-baloo-semibold ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                                    {t('subscription.monthlyPayment')}
                                                </Text>

                                            </View>
                                            <Text className={`text-2xl font-baloo-bold ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                                {monthlyPrice}
                                            </Text>
                                        </View>
                                    </BlurView>
                                </TouchableOpacity>

                                {/* Yearly Option */}
                                <TouchableOpacity
                                    onPress={onSelectYearly}
                                    className="rounded-2xl overflow-hidden"
                                >
                                    <BlurView
                                        intensity={90}
                                        tint={isNight ? "dark" : "light"}
                                        className="p-4 relative"
                                        style={{ backgroundColor: isNight ? '#334155' : '#e2e8f0' }}
                                    >
                                        <View className="absolute top-4 right-4 flex items-center justify-center bg-green-500 h-7 px-4 rounded-lg">
                                            <Text className="text-white text-xs font-baloo-semibold pt-1">
                                                {t('subscription.save20')}
                                            </Text>
                                        </View>
                                        <View className="flex-row justify-between items-center">
                                            <View>
                                                <Text className={`text-xl font-baloo-semibold ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                                    {t('subscription.yearlyPayment')}
                                                </Text>
                                                <Text className={`text-sm font-baloo mt-3 ${isNight ? 'text-white/60' : 'text-slate-500'}`}>
                                                    {t('subscription.bestOffer')}
                                                </Text>
                                            </View>
                                            <Text className={`text-2xl self-end -mb-2 font-baloo-bold ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                                {yearlyPrice}
                                            </Text>
                                        </View>
                                    </BlurView>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}
