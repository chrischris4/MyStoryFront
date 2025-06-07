import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import BottomNavBar from '~/navigation/BottomNavBar';
import type { Story, RootStackParamList } from '~/types';

type StoryDetailRouteProp = RouteProp<RootStackParamList, 'StoryDetail'>;

export default function StoryDetailScreen() {
    const route = useRoute<StoryDetailRouteProp>();
    const { storyId } = route.params;
    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const response = await fetch(`http://localhost:3000/story/detail/${storyId}`);
                if (!response.ok) throw new Error('Erreur lors de la récupération de la story');

                const data: Story = await response.json();
                setStory(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStory();
    }, [storyId]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#6b21a8" />
                <Text>Chargement...</Text>
            </View>
        );
    }

    if (error || !story) {
        return (
            <View className="flex-1 items-center justify-centerpb-20">
                <Text className="text-red-500">{error ?? 'Story non trouvée'}</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView className="flex-1 bg-white px-4 pt-10">
                <Text className="text-2xl font-bold mb-4 text-center">{story.title}</Text>

                {story.pages
                    .sort((a, b) => a.pageIndex - b.pageIndex)
                    .map((page) => (
                        <View key={page.id} className="mb-6 bg-gray-100 p-4 rounded-lg shadow">
                            <Text className="mb-2 text-base">{page.text}</Text>
                            <Image
                                source={{ uri: page.imageUrl }}
                                style={{ width: '100%', height: 200, borderRadius: 10 }}
                                resizeMode="cover"
                            />
                        </View>
                    ))}
            </ScrollView>
            <BottomNavBar />
        </>
    );
}
