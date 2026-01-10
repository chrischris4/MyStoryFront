import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Dimensions,
    Pressable,
    LayoutChangeEvent,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, MainTabParamList } from '~/types';
import { BlurView } from 'expo-blur';

type StoryFolderNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
>;

type StoryFolderProps = {
    title: string;
    icon?: React.ReactNode;
    storyType: string;
    description: string;
    stories: any[];
    isNight: boolean;
    isPremium?: boolean;
    isShared?: boolean;
    isLoading?: boolean;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NAVBAR_HEIGHT = 80; // Hauteur de la navbar + marges

// Composant Skeleton pour les stories
const StorySkeleton = () => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true
        );
    }, []);

    const skeletonStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View className="mb-2 p-4 bg-gray-100 rounded-3xl">
            <Animated.View style={skeletonStyle}>
                <View className="h-6 bg-gray-300 rounded-lg mb-2 w-3/4" />
                <View className="h-[150px] bg-gray-300 rounded-lg mb-2" />
                <View className="flex flex-row justify-between items-center">
                    <View className="h-4 bg-gray-300 rounded w-1/2" />
                    <View className="h-4 bg-gray-300 rounded w-8" />
                </View>
            </Animated.View>
        </View>
    );
};

export default function StoryFolder({
    isShared,
    title,
    storyType,
    icon,
    isPremium,
    description,
    stories,
    isNight,
    isLoading = false,
}: StoryFolderProps) {
    const [expanded, setExpanded] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [layoutY, setLayoutY] = useState(0);
    const width = useSharedValue(SCREEN_WIDTH / 1.08);
    const height = useSharedValue(84);
    const translateY = useSharedValue(0);
    const navigation = useNavigation<StoryFolderNavigationProp>();
    const animatedStyle = useAnimatedStyle(() => ({
        width: withTiming(width.value, { duration: 300 }),
        height: withTiming(height.value, { duration: 300 }),
        borderRadius: withTiming(expanded ? 0 : 24, { duration: 300 }),
        transform: [{ translateY: withTiming(translateY.value, { duration: 300 }) }],
    }));

    const onLayout = (event: LayoutChangeEvent) => {
        const { y } = event.nativeEvent.layout;
        setLayoutY(y);
    };

    const handleToggle = () => {
        // Empêcher l'expansion si l'utilisateur n'est pas premium et que c'est un dossier partagé
        if (!isPremium && isShared && !expanded) {
            navigation.navigate('BillingScreen');
            return;
        }

        if (expanded) {
            setShowContent(false);
            width.value = SCREEN_WIDTH / 1.08;
            height.value = 84;
            translateY.value = 0;
        } else {
            width.value = SCREEN_WIDTH;
            height.value = SCREEN_HEIGHT - NAVBAR_HEIGHT; // Laisser de la place pour la navbar
            translateY.value = -layoutY;
            // Retarder légèrement l'affichage du contenu pour une animation plus fluide
            setTimeout(() => setShowContent(true), 150);
        }
        setExpanded(!expanded);
    };


    return (
        <Pressable
            onPress={() => {
                if (!expanded) handleToggle();
            }} className="flex items-center justify-center w-full z-20"
            onLayout={onLayout}
        >
            <Animated.View style={[animatedStyle, { overflow: 'hidden', borderRadius: 24 }]}>
                {!isPremium && isShared && (
                    <View className='absolute top-3 z-30 right-4 h-10 w-10 flex justify-center items-center rounded-full'>
                        <Feather
                            name="lock"
                            size={20}
                            color='black'
                        />

                    </View>
                )}
                <BlurView
                    intensity={50}
                    tint="light"
                    style={{ flex: 1, padding: 16, borderRadius: 24 }}
                >
                    <View
                        className="w-full mb-4 relative"
                        style={{ flex: expanded ? 1 : undefined }}
                    >
                        <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start`}>{title}</Text>
                        <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-slate-500 text-lg font-baloo`}>{description}</Text>

                        {expanded && (
                            <Pressable
                                onPress={handleToggle}
                                className="absolute -top-2 -right-1 p-2"
                            >
                                <Feather name="x" size={24} color="#fff" />
                            </Pressable>
                        )}

                        {expanded && !showContent ? (
                            <View style={{ flex: 1, marginTop: 16 }}>
                                <StorySkeleton />
                                <StorySkeleton />
                                <StorySkeleton />
                            </View>
                        ) : expanded && showContent && isLoading ? (
                            <View className="flex-1 items-center justify-center mt-6">
                                <ActivityIndicator size="large" color={isNight ? "#ffffff" : "#1e293b"} />
                                <Text className={`${isNight ? "text-white" : "text-slate-800"} font-baloo mt-2`}>
                                    Chargement...
                                </Text>
                            </View>
                        ) : expanded && showContent && stories.length === 0 ? (
                            <View className="flex-1 items-center  mt-6">
                                <Text className="text-gray-500 mb-4 font-baloo-medium">Pas d'histoires créées.</Text>
                                <TouchableOpacity
                                    className="bg-white px-4 py-2 rounded-lg"
                                    onPress={() => navigation.navigate('CreateStory')}
                                >
                                    <Text className="font-baloo-semibold">Créer une histoire</Text>
                                </TouchableOpacity>
                            </View>
                        ) : expanded && showContent ? (
                            <FlatList
                                data={stories}
                                keyExtractor={(item) => item.id.toString()}
                                style={{ flex: 1, marginTop: 16 }}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                                initialNumToRender={3}
                                maxToRenderPerBatch={3}
                                windowSize={5}
                                removeClippedSubviews={true}
                                renderItem={({ item }) => {
                                    const firstPageImage = item.pages?.[0]?.imageUrl;

                                    return (
                                        <TouchableOpacity
                                            className="mb-2 p-4 bg-gray-100 rounded-3xl"
                                            onPress={() =>
                                                navigation.navigate('StoryDetail', { storyId: item.id })
                                            }
                                        >
                                            <Text className="text-xl font-baloo-semibold mb-1">{item.title}</Text>

                                            {firstPageImage && (
                                                <Image
                                                    source={{ uri: firstPageImage }}
                                                    style={{ width: '100%', height: 150, borderRadius: 8 }}
                                                    contentFit="cover"
                                                    cachePolicy="memory-disk"
                                                    transition={200}
                                                />
                                            )}
                                            <View className='flex flex-row gap-1 justify-between items-center w-full'>
                                                <Text className="text-base font-baloo-semibold text-black ml-2">
                                                    Auteur : <Text className='font-baloo'>{item.user?.profil?.name || 'Anonyme'}</Text>
                                                </Text>
                                                <Text className="text-lg font-medium mr-2"><Feather name="heart" size={14} color="#334155" /></Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        ) : null}
                    </View>
                </BlurView>
            </Animated.View>
        </Pressable>
    );
}
