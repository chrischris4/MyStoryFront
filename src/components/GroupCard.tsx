import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

type GroupCardProps = {
    group: any;
    isNight: boolean;
    onPress: () => void;
};

export default function GroupCard({ group, isNight, onPress }: GroupCardProps) {
    const { t } = useTranslation();
    const memberCount = group._count?.members || 0;
    const storiesCount = group._count?.stories || 0;


    return (
        <TouchableOpacity onPress={onPress} className="mb-3">
            <BlurView
                intensity={90}
                tint={isNight ? "dark" : "light"}
                className="p-4 rounded-2xl overflow-hidden"
                style={{ backgroundColor: isNight ? '#1e293b90' : '' }}
            >
                <Text className={`${isNight ? "text-white" : "text-slate-800"} text-xl font-baloo-semibold`}>
                    {group.name}
                </Text>
                <Text className={`${isNight ? "text-white/70" : "text-slate-600"} text-base font-baloo mt-1`}>
                    {group.description || t('groups.noDescription')}
                </Text>
                <View className="flex-row items-center mt-2 gap-4">
                    <View className='flex flex-row items-center gap-1'>
                        <Feather name="users" size={14} color={isNight ? '#94a3b8' : '#64748b'} />
                        <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} text-sm font-baloo ml-1`}>
                            {t('groups.membersCount', { count: memberCount })}
                        </Text>
                    </View>
                    <View className='flex flex-row items-center gap-1'>
                        <Feather name="book" size={14} color={isNight ? '#94a3b8' : '#64748b'} />
                        <Text className={`${isNight ? 'text-slate-400' : 'text-slate-500'} text-sm font-baloo ml-1`}>
                            {t('groups.storiesCount', { count: storiesCount })}
                        </Text>
                    </View>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
}
