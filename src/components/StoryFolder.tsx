import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    Dimensions,
    Pressable,
    LayoutChangeEvent,
    TouchableOpacity,
    FlatList,
    ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    FadeInDown,
} from 'react-native-reanimated';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, MainTabParamList } from '~/types';
import { getHumanEmoji } from '~/types';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import Slider from '@react-native-community/slider';

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

const LANGUAGE_FLAGS: Record<string, string> = {
    french: '🇫🇷',
    english: '🇬🇧',
    spanish: '🇪🇸',
    german: '🇩🇪',
    italian: '🇮🇹',
    portuguese: '🇵🇹',
    danish: '🇩🇰',
};

const getLanguageFlag = (language: string): string => {
    return LANGUAGE_FLAGS[language.toLowerCase()] || '🌍';
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NAVBAR_HEIGHT = 80;

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
    isPremium,
    description,
    stories,
    isNight,
    storyType,
    isLoading = false,
}: StoryFolderProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [layoutY, setLayoutY] = useState(0);

    // États des filtres
    const [showFilters, setShowFilters] = useState(false);
    const [maxPages, setMaxPages] = useState(20);
    const [selectedCharacterType, setSelectedCharacterType] = useState<'ALL' | 'HUMAN' | 'ANIMAL'>('ALL');

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


    // Détermine si les filtres doivent être affichés
    const shouldShowFilters = storyType === 'ALL' || storyType === 'FAVORITE';

    // Calcul du nombre max de pages dans les stories
    const maxPagesInStories = useMemo(() => {
        if (!stories || stories.length === 0) return 20;
        return Math.max(...stories.map(story => story.numberOfPages || 0));
    }, [stories]);

    // Filtrage des stories
    const filteredStories = useMemo(() => {
        if (!shouldShowFilters) return stories;

        return stories.filter(story => {
            // Filtre par nombre de pages
            const pagesMatch = (story.numberOfPages || 0) <= maxPages;

            // Filtre par type de personnage (vérifie si au moins un personnage correspond)
            // Note: story.characters contient des StoryCharacter avec une propriété character imbriquée
            let characterMatch = true;
            if (selectedCharacterType !== 'ALL' && story.characters?.length > 0) {
                if (selectedCharacterType === 'HUMAN') {
                    characterMatch = story.characters.some((sc: any) => sc.character?.type === 'HUMAN');
                } else if (selectedCharacterType === 'ANIMAL') {
                    characterMatch = story.characters.some((sc: any) => sc.character?.type === 'ANIMAL');
                }
            } else if (selectedCharacterType !== 'ALL') {
                characterMatch = false;
            }

            return pagesMatch && characterMatch;
        });
    }, [stories, maxPages, selectedCharacterType, shouldShowFilters]);

    // Pour les non-premium sur les folders partagés, limiter à 5 histoires
    const isLockedPreview = !isPremium && isShared;
    const displayedStories = useMemo(() => {
        if (isLockedPreview) {
            return filteredStories.slice(0, 5);
        }
        return filteredStories;
    }, [filteredStories, isLockedPreview]);

    const onLayout = (event: LayoutChangeEvent) => {
        const { y } = event.nativeEvent.layout;
        setLayoutY(y);
    };

    const handleToggle = () => {
        if (expanded) {
            setShowContent(false);
            width.value = SCREEN_WIDTH / 1.08;
            height.value = 84;
            translateY.value = 0;
        } else {
            const EXPANDED_TOP = 10;
            width.value = SCREEN_WIDTH;
            height.value = SCREEN_HEIGHT - NAVBAR_HEIGHT;
            translateY.value = EXPANDED_TOP - layoutY;
            const delay = !isLoading && stories.length > 0 ? 300 : 800;
            setTimeout(() => setShowContent(true), delay);
        }

        setExpanded(!expanded);
    };
    return (
        <Pressable
            onPress={() => {
                if (!expanded) handleToggle();
            }}
            className="flex items-center justify-center w-full"
            style={{ zIndex: 20 }}
            onLayout={onLayout}
        >
            <Animated.View style={[animatedStyle, { overflow: 'hidden', borderRadius: 24 }]}>
                <BlurView
                    intensity={90}
                    tint={isNight ? "dark" : "light"}
                    style={{
                        flex: 1, padding: 16, borderRadius: 24, backgroundColor: isNight ? '#1e293b90' : ''
                    }}
                >
                    <View
                        className="w-full mb-4 relative"
                        style={{ flex: expanded ? 1 : undefined }}
                    >
                        <View className="flex flex-row items-center gap-3">
                            <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl font-baloo-semibold self-start`}>{title}</Text>
                            <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-lg font-baloo self-start`}>
                                ( {shouldShowFilters ? filteredStories.length : stories.length} )
                            </Text>
                        </View>
                        <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-slate-500 text-lg font-baloo`}>{description}</Text>

                        {expanded && (
                            <Pressable
                                onPress={handleToggle}
                                className="absolute -top-2 -right-1 p-2"
                            >
                                <Feather name="x" size={24} color={isNight ? "rgba(255, 255, 255, 0.8)" : "rgb(71, 85, 105)"} />
                            </Pressable>
                        )}

                        {/* Bouton toggle filtres - uniquement pour ALL et FAVORITE */}
                        {expanded && isPremium && showContent && shouldShowFilters && !isLoading && (
                            <TouchableOpacity
                                onPress={() => setShowFilters(!showFilters)}
                                className={`mt-2 flex-row items-center justify-center py-2 px-4 rounded-xl self-start ${showFilters
                                    ? 'bg-blue-500'
                                    : isNight ? 'bg-white/20' : 'bg-gray-200'
                                    }`}
                            >
                                <Feather
                                    name={showFilters ? "filter" : "filter"}
                                    size={16}
                                    color={showFilters ? "#fff" : isNight ? "#fff" : "#475569"}
                                />
                                <Text className={`ml-2 font-baloo ${showFilters ? 'text-white' : isNight ? 'text-white' : 'text-slate-700'
                                    }`}>
                                    {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
                                </Text>
                                <Feather
                                    name={showFilters ? "chevron-up" : "chevron-down"}
                                    size={16}
                                    color={showFilters ? "#fff" : isNight ? "#fff" : "#475569"}
                                    style={{ marginLeft: 4 }}
                                />
                            </TouchableOpacity>
                        )}

                        {/* Filtres - uniquement pour ALL et FAVORITE */}
                        {expanded && showContent && shouldShowFilters && !isLoading && showFilters && (
                            <View className="mt-2 mb-4 bg-white/10 rounded-2xl p-4">
                                {/* Filtre type de personnage */}
                                <Text className={`${isNight ? "text-white" : "text-slate-800"} font-baloo-semibold mb-2`}>
                                    Type de personnage
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="mb-4"
                                >
                                    <TouchableOpacity
                                        onPress={() => setSelectedCharacterType('ALL')}
                                        className={`mr-2 px-4 py-2 rounded-full ${selectedCharacterType === 'ALL'
                                            ? 'bg-blue-500'
                                            : isNight ? 'bg-white/20' : 'bg-gray-200'
                                            }`}
                                    >
                                        <Text className={`font-baloo ${selectedCharacterType === 'ALL'
                                            ? 'text-white'
                                            : isNight ? 'text-white' : 'text-slate-700'
                                            }`}>
                                            Tous
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setSelectedCharacterType('HUMAN')}
                                        className={`mr-2 px-4 py-2 rounded-full ${selectedCharacterType === 'HUMAN'
                                            ? 'bg-blue-500'
                                            : isNight ? 'bg-white/20' : 'bg-gray-200'
                                            }`}
                                    >
                                        <Text className={`font-baloo ${selectedCharacterType === 'HUMAN'
                                            ? 'text-white'
                                            : isNight ? 'text-white' : 'text-slate-700'
                                            }`}>
                                            👤 Humain
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setSelectedCharacterType('ANIMAL')}
                                        className={`px-4 py-2 rounded-full ${selectedCharacterType === 'ANIMAL'
                                            ? 'bg-orange-500'
                                            : isNight ? 'bg-white/20' : 'bg-gray-200'
                                            }`}
                                    >
                                        <Text className={`font-baloo ${selectedCharacterType === 'ANIMAL'
                                            ? 'text-white'
                                            : isNight ? 'text-white' : 'text-slate-700'
                                            }`}>
                                            🐾 Animal
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>

                                {/* Filtre nombre de pages */}
                                <Text className={`${isNight ? "text-white" : "text-slate-800"} font-baloo-semibold mb-2`}>
                                    Nombre de pages max : {maxPages}
                                </Text>
                                <Slider
                                    style={{ width: '100%', height: 40 }}
                                    minimumValue={1}
                                    maximumValue={maxPagesInStories}
                                    step={1}
                                    value={maxPages}
                                    onValueChange={setMaxPages}
                                    minimumTrackTintColor={isNight ? "#3b82f6" : "#2563eb"}
                                    maximumTrackTintColor={isNight ? "rgba(255,255,255,0.3)" : "#cbd5e1"}
                                    thumbTintColor="#3b82f6"
                                />
                                <View className="flex flex-row justify-between">
                                    <Text className={`${isNight ? "text-white/60" : "text-slate-500"} text-sm font-baloo`}>
                                        1 page
                                    </Text>
                                    <Text className={`${isNight ? "text-white/60" : "text-slate-500"} text-sm font-baloo`}>
                                        {maxPagesInStories} pages
                                    </Text>
                                </View>
                            </View>
                        )}

                        {expanded && !showContent && (isLoading || stories.length === 0) ? (
                            <View style={{ flex: 1, marginTop: 16 }}>
                                <StorySkeleton />
                                <StorySkeleton />
                                <StorySkeleton />
                            </View>
                        ) : expanded && showContent && isLoading ? (
                            <View className="flex-1 items-center justify-center mt-6">
                                <LottieView
                                    source={require('../../assets/animations/LoadingWhite.json')}
                                    autoPlay
                                    loop={true}
                                    style={{ width: 100, height: 100 }}
                                />
                                <Text className={`${isNight ? "text-white" : "text-slate-800"} font-baloo mt-2`}>
                                    {t('common.loading')}
                                </Text>
                            </View>
                        ) : expanded && showContent && filteredStories.length === 0 ? (
                            <View className="flex-1 items-center mt-6">
                                <Text className="text-gray-500 mb-4 font-baloo-medium">
                                    {shouldShowFilters
                                        ? "Aucune histoire ne correspond aux filtres"
                                        : t('storyFolder.noStoriesCreated')
                                    }
                                </Text>
                                {!shouldShowFilters && (
                                    <TouchableOpacity
                                        className="bg-white px-4 py-2 rounded-lg"
                                        onPress={() => navigation.navigate('CreateStory')}
                                    >
                                        <Text className="font-baloo-semibold">{t('storyFolder.createStory')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : expanded && showContent ? (
                            <FlatList
                                data={displayedStories}
                                keyExtractor={(item, index) => `${item.id}-${index}`}
                                style={{ flex: 1, marginTop: 16 }}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                                initialNumToRender={3}
                                maxToRenderPerBatch={3}
                                windowSize={5}
                                removeClippedSubviews={true}
                                renderItem={({ item, index }) => {
                                    const cover = item.coverUrl;

                                    return (
                                        <Animated.View
                                            entering={FadeInDown.delay(index * 100).springify().damping(50)}
                                        >
                                            <TouchableOpacity
                                                activeOpacity={isLockedPreview ? 1 : 0.5}
                                                className="mb-2 p-4 bg-gray-100 rounded-3xl relative"
                                                onPress={() => {
                                                    if (isLockedPreview) {
                                                        return;
                                                    }
                                                    navigation.navigate('StoryDetail', { storyId: item.id });
                                                }}
                                            >
                                                {isLockedPreview && (
                                                    <TouchableOpacity
                                                        onPress={() => navigation.navigate('BillingScreen')}
                                                        className='absolute top-14 right-6 z-10 rounded-full overflow-hidden'
                                                        activeOpacity={0.8}
                                                    >
                                                        <BlurView
                                                            intensity={90}
                                                            tint="light"
                                                            className='flex px-4 flex-row gap-3 p-2'
                                                        >
                                                            <Text className="text-slate-800 font-baloo text-sm">
                                                                Deviens explorateur pour tout débloquer
                                                            </Text>
                                                            <Feather name="arrow-right" size={16} color="#1e293b" />
                                                        </BlurView>
                                                    </TouchableOpacity>
                                                )}
                                                <View className="flex flex-row justify-between items-center mb-1">
                                                    <Text className="text-xl font-baloo-semibold">{item.title}</Text>
                                                </View>
                                                {cover && (
                                                    <Image
                                                        source={{ uri: cover }}
                                                        style={{ width: '100%', height: 150, borderRadius: 8 }}
                                                        contentFit="cover"
                                                        cachePolicy="memory-disk"
                                                        transition={200}
                                                    />
                                                )}

                                                {item.description && (
                                                    <Text className="text-sm text-slate-600 font-baloo mt-2" numberOfLines={2}>
                                                        {item.description}
                                                    </Text>
                                                )}

                                                {item.characters && item.characters.length > 0 && (
                                                    <View className='flex flex-row flex-wrap gap-2 mt-2 mb-1'>
                                                        {item.characters.map((storyCharacter: any) => {
                                                            const character = storyCharacter.character;
                                                            if (!character) return null;
                                                            return (
                                                                <View key={storyCharacter.id} className='flex flex-row items-center gap-2 bg-white/90 rounded-xl px-3 py-2'>
                                                                    <View
                                                                        className={`w-8 h-8 rounded-full items-center justify-center ${character.type === 'HUMAN' ? 'bg-blue-500' : 'bg-orange-500'
                                                                            }`}
                                                                    >
                                                                        <Text className="text-base">
                                                                            {getHumanEmoji(character)}
                                                                        </Text>
                                                                    </View>
                                                                    <Text className="text-sm font-baloo-semibold text-slate-700">
                                                                        {character.name}
                                                                    </Text>
                                                                </View>
                                                            );
                                                        })}
                                                    </View>
                                                )}

                                                <View className='flex flex-row gap-1 justify-between items-center w-full mt-2'>
                                                    <Text className="text-base font-baloo-semibold text-black ml-2">
                                                        {t('storyFolder.author')} : <Text className='font-baloo'>{item.user?.profil?.name || t('storyFolder.anonymous')}</Text>
                                                    </Text>
                                                    <View className='flex flex-row items-center gap-2'>
                                                        {item.language && (
                                                            <Text style={{ fontSize: 16 }}>{getLanguageFlag(item.language)}</Text>
                                                        )}
                                                        <View className="flex-row items-center gap-1 bg-slate-200 rounded-full px-2 py-0.5">
                                                            <Feather name="book-open" size={12} color="#64748b" />
                                                            <Text className="text-sm font-baloo-semibold text-slate-600">{item.numberOfPages}</Text>
                                                        </View>
                                                        {item._count?.favoriteBy > 0 && (
                                                            <View className="flex-row items-center gap-1 bg-red-50 rounded-full px-2 py-0.5">
                                                                <Ionicons name="heart" size={12} color="#ef4444" />
                                                                <Text className="text-sm font-baloo-semibold text-red-500">{item._count.favoriteBy}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
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
