import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    Pressable,
    LayoutChangeEvent,
    TouchableOpacity,
    FlatList,
    ScrollView,
    useWindowDimensions,
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
    fr: '🇫🇷',
    english: '🇬🇧',
    en: '🇬🇧',
    spanish: '🇪🇸',
    es: '🇪🇸',
    german: '🇩🇪',
    de: '🇩🇪',
    italian: '🇮🇹',
    it: '🇮🇹',
    portuguese: '🇵🇹',
    pt: '🇵🇹',
    danish: '🇩🇰',
    da: '🇩🇰',
};

const getLanguageFlag = (language: string): string => {
    return LANGUAGE_FLAGS[language.toLowerCase()] || '🌍';
};

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
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isMd = screenWidth >= 768;
    const numColumns = isMd ? 2 : 1;
    const columnGap = 8;
    const containerPadding = isMd ? 28 : 16;
    const itemWidth = isMd ? (screenWidth - containerPadding * 2 - columnGap) / 2 : undefined;
    const [expanded, setExpanded] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [layoutY, setLayoutY] = useState(0);

    // États des filtres
    const [showFilters, setShowFilters] = useState(false);
    const [maxPages, setMaxPages] = useState(20);
    const [selectedCharacterType, setSelectedCharacterType] = useState<'ALL' | 'HUMAN' | 'ANIMAL'>('ALL');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');

    const width = useSharedValue(screenWidth / 1.08);
    const height = useSharedValue(isMd ? 110 : 84);
    const translateY = useSharedValue(0);
    const navigation = useNavigation<StoryFolderNavigationProp>();
    const initialAnimDone = useRef(false);

    useEffect(() => {
        if (showContent) {
            const timer = setTimeout(() => { initialAnimDone.current = true; }, 1000);
            return () => clearTimeout(timer);
        } else {
            initialAnimDone.current = false;
        }
    }, [showContent]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: withTiming(width.value, { duration: 300 }),
        height: withTiming(height.value, { duration: 300 }),
        borderRadius: withTiming(expanded ? 0 : 24, { duration: 300 }),
        transform: [{ translateY: withTiming(translateY.value, { duration: 300 }) }],
    }));

    // Calcul du nombre max de pages dans les stories
    const maxPagesInStories = useMemo(() => {
        if (!stories || stories.length === 0) return 12;
        return Math.max(...stories.map(story => story.numberOfPages || 0));
    }, [stories]);

    // Langues disponibles dans les stories
    const availableLanguages = useMemo(() => {
        const langs = new Set<string>();
        stories.forEach(story => {
            if (story.language) langs.add(story.language.toLowerCase());
        });
        return Array.from(langs);
    }, [stories]);

    // Filtrage des stories
    const filteredStories = useMemo(() => {
        return stories.filter(story => {
            // Filtre par nombre de pages
            const pagesMatch = (story.numberOfPages || 0) <= maxPages;

            // Filtre par type de personnage
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

            // Filtre par langue
            const languageMatch = selectedLanguage === 'ALL' || story.language?.toLowerCase() === selectedLanguage;

            return pagesMatch && characterMatch && languageMatch;
        });
    }, [stories, maxPages, selectedCharacterType, selectedLanguage]);

    // Pour les non-premium sur les folders partagés, limiter à 5 histoires
    const isLockedPreview = !isPremium && isShared;
    const displayedStories = useMemo(() => {
        const stories = isLockedPreview ? filteredStories.slice(0, 5) : filteredStories;
        if (isLockedPreview) {
            return [...stories, { id: '__locked__', _isLockedCard: true } as any];
        }
        return stories;
    }, [filteredStories, isLockedPreview]);

    const onLayout = (event: LayoutChangeEvent) => {
        const { y } = event.nativeEvent.layout;
        setLayoutY(y);
    };

    const handleToggle = () => {
        if (expanded) {
            setShowContent(false);
            width.value = screenWidth / 1.08;
            height.value = isMd ? 110 : 84;
            translateY.value = 0;
        } else {
            const EXPANDED_TOP = 10;
            width.value = screenWidth;
            height.value = screenHeight - NAVBAR_HEIGHT;
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
                        flex: 1, padding: isMd ? 28 : 16, borderRadius: 24, backgroundColor: isNight ? '#1e293b90' : '#38b6ff10'
                    }}
                >
                    <View
                        className="w-full mb-4 relative"
                        style={{ flex: expanded ? 1 : undefined }}
                    >
                        <View className="flex flex-row items-center gap-3 md:gap-4">
                            <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-2xl md:text-3xl font-baloo-semibold self-start`}>{title}</Text>
                            <Text className={` ${isNight ? "text-white" : "text-slate-800"} text-lg md:text-xl font-baloo self-start`}>
                                ( {filteredStories.length ? filteredStories.length : stories.length} )
                            </Text>
                        </View>
                        <Text className={` ${isNight ? "text-white/80" : "text-slate-600"} text-slate-500 text-lg md:text-xl font-baloo`}>{description}</Text>

                        {expanded && (
                            <Pressable
                                onPress={handleToggle}
                                className="absolute -top-2 -right-1 p-2"
                            >
                                <Feather name="x" size={24} color={isNight ? "rgba(255, 255, 255, 0.8)" : "rgb(71, 85, 105)"} />
                            </Pressable>
                        )}

                        {/* Bouton toggle filtres - uniquement pour ALL et FAVORITE */}
                        {expanded && (!isShared || isPremium) && showContent && !isLoading && (
                            <TouchableOpacity
                                onPress={() => setShowFilters(!showFilters)}
                                className={`mt-2 flex-row items-center justify-center py-2 px-4 rounded-xl self-start w-full ${showFilters
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
                                    {showFilters ? t('storyFolder.hideFilters') : t('storyFolder.showFilters')}
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
                        {expanded && showContent && !isLoading && showFilters && (
                            <View className="mt-2 bg-white/20 rounded-2xl p-4">
                                {/* Filtre type de personnage */}
                                <Text className={`${isNight ? "text-white" : "text-slate-800"} font-baloo-semibold mb-2`}>
                                    {t('storyFolder.characterType')}
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
                                            {t('storyFolder.all')}
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
                                            {t('storyFolder.human')}
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
                                            {t('storyFolder.animal')}
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>

                                {/* Filtre langue */}
                                <Text className={`${isNight ? "text-white" : "text-slate-800"} font-baloo-semibold mb-2`}>
                                    {t('storyFolder.language')}
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="mb-4"
                                >
                                    <TouchableOpacity
                                        onPress={() => setSelectedLanguage('ALL')}
                                        className={`mr-2 px-4 py-2 rounded-full ${selectedLanguage === 'ALL'
                                            ? 'bg-blue-500'
                                            : isNight ? 'bg-white/20' : 'bg-gray-200'
                                            }`}
                                    >
                                        <Text className={`font-baloo ${selectedLanguage === 'ALL'
                                            ? 'text-white'
                                            : isNight ? 'text-white' : 'text-slate-700'
                                            }`}>
                                            {t('storyFolder.allLanguages')}
                                        </Text>
                                    </TouchableOpacity>
                                    {availableLanguages.map(lang => (
                                        <TouchableOpacity
                                            key={lang}
                                            onPress={() => setSelectedLanguage(lang)}
                                            className={`mr-2 px-4 py-2 rounded-full ${selectedLanguage === lang
                                                ? 'bg-blue-500'
                                                : isNight ? 'bg-white/20' : 'bg-gray-200'
                                                }`}
                                        >
                                            <Text className={`font-baloo ${selectedLanguage === lang
                                                ? 'text-white'
                                                : isNight ? 'text-white' : 'text-slate-700'
                                                }`}>
                                                {getLanguageFlag(lang)} {t(`storyFolder.languages.${lang}`, lang)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Filtre nombre de pages */}
                                <Text className={`${isNight ? "text-white" : "text-slate-800"} font-baloo-semibold mb-2`}>
                                    {t('storyFolder.maxPages', { count: maxPages })}
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
                                        {t('storyFolder.onePage')}
                                    </Text>
                                    <Text className={`${isNight ? "text-white/60" : "text-slate-500"} text-sm font-baloo`}>
                                        {t('storyFolder.nPages', { count: maxPagesInStories })}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {expanded && !showContent && (isLoading || stories.length === 0) ? (
                            <View style={{ flex: 1, marginTop: 16 }}>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <StorySkeleton key={i} />
                                ))}
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
                            <View className="flex-1 items-center mt-2">
                                <Text className={`${isNight ? "text-white" : "text-slate-800"} mb-4 font-baloo-medium`}>
                                    {showFilters
                                        ? t('storyFolder.noMatchingStories')
                                        : t('storyFolder.noStoriesCreated')
                                    }
                                </Text>
                                {!showFilters && (
                                    <TouchableOpacity
                                        className="bg-white px-4 md:px-8 py-2 rounded-lg"
                                        onPress={() => navigation.navigate('CreateStory')}
                                    >
                                        <Text className="font-baloo-semibold">{t('storyFolder.createStory')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : expanded && showContent ? (
                            <FlatList
                                key={numColumns}
                                data={displayedStories}
                                keyExtractor={(item, index) => `${item.id}-${index}`}
                                numColumns={numColumns}
                                style={{ flex: 1, marginTop: 16 }}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                columnWrapperStyle={numColumns > 1 ? { gap: columnGap } : undefined}
                                showsVerticalScrollIndicator={false}
                                initialNumToRender={6}
                                maxToRenderPerBatch={5}
                                windowSize={11}
                                removeClippedSubviews={false}
                                renderItem={({ item, index }) => {
                                    if (item._isLockedCard) {
                                        return (
                                            <Animated.View
                                                entering={!initialAnimDone.current ? FadeInDown.duration(200) : undefined}
                                                style={itemWidth ? { width: itemWidth, marginBottom: 16 } : { marginBottom: 16 }}
                                            >
                                                <TouchableOpacity
                                                    activeOpacity={0.7}
                                                    onPress={() => navigation.navigate('BillingScreen')}
                                                    className={`mb-2 p-4 rounded-3xl items-center justify-center ${isNight ? 'bg-slate-800' : 'bg-gray-100'}`}
                                                >
                                                    <Feather name="lock" size={32} color={isNight ? '#94a3b8' : '#64748b'} />
                                                    <Text className={`text-center text-base font-baloo-medium mt-3 ${isNight ? 'text-slate-300' : 'text-slate-600'}`}>
                                                        {t('storyFolder.subscriptionRequired')}
                                                    </Text>
                                                    <View className="flex-row items-center gap-2 mt-3 bg-blue-500 rounded-full px-4 py-2">
                                                        <Text className="text-white font-baloo-semibold text-sm">{t('storyFolder.subscribe')}</Text>
                                                        <Feather name="arrow-right" size={16} color="white" />
                                                    </View>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        );
                                    }

                                    const cover = item.coverUrl;
                                    const isGenerating = item.status === 'PENDING' || item.status === 'GENERATING';
                                    const isFailed = item.status === 'FAILED';

                                    return (
                                        <Animated.View
                                            entering={!initialAnimDone.current && index < 6 ? FadeInDown.delay(index * 100).springify().damping(50) : undefined}
                                            style={itemWidth ? { width: itemWidth } : undefined}
                                        >
                                            <TouchableOpacity
                                                activeOpacity={isLockedPreview || isGenerating || isFailed ? 1 : 0.5}
                                                className={`mb-2 p-4 rounded-3xl relative ${isNight ? 'bg-slate-800' : 'bg-gray-100'}`}
                                                onPress={() => {
                                                    if (isLockedPreview || isGenerating || isFailed) {
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
                                                            style={{
                                                                backgroundColor: isNight ? '#1e293b90' : '#38b6ff40',
                                                            }}
                                                            tint="light"
                                                            className='flex px-4 flex-row gap-3 p-2'
                                                        >
                                                            <Text className="text-slate-800 font-baloo text-sm">
                                                                {t('storyFolder.unlockPremium')}
                                                            </Text>
                                                            <Feather name="arrow-right" size={16} color="#1e293b" />
                                                        </BlurView>
                                                    </TouchableOpacity>
                                                )}
                                                <View>
                                                    <View className="mb-1">
                                                        <Text className={` ${isNight ? 'text-white' : 'text-slate-800'} text-xl font-baloo-semibold`}>{item.title}</Text>
                                                    </View>
                                                    {isGenerating && (
                                                        <View className="flex-row items-center gap-2 bg-amber-100 rounded-xl p-3 mb-2">
                                                            <LottieView
                                                                source={require('../../assets/animations/LoadingWhite.json')}
                                                                autoPlay
                                                                loop={true}
                                                                style={{ width: 30, height: 30 }}
                                                            />
                                                            <Text className="text-amber-800 font-baloo-medium text-sm flex-1">
                                                                {t('storyFolder.generating')}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    {isFailed && (
                                                        <View className="flex-row items-center gap-2 bg-red-100 rounded-xl p-3 mb-2">
                                                            <Feather name="alert-circle" size={20} color="#dc2626" />
                                                            <Text className="text-red-700 font-baloo-medium text-sm flex-1">
                                                                {t('storyFolder.generationFailed')}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    {cover && !isGenerating && !isFailed && (
                                                        <View style={{ position: 'relative' }}>
                                                            <Image
                                                                source={{ uri: cover }}
                                                                style={{ width: '100%', height: 150, borderRadius: 8 }}
                                                                contentFit="cover"
                                                                cachePolicy="memory-disk"
                                                                transition={200}
                                                            />
                                                            {isNight && (
                                                                <View style={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                                                    borderRadius: 8,
                                                                }} />
                                                            )}
                                                        </View>
                                                    )}

                                                    {item.description && (
                                                        <Text className={`text-sm ${isNight ? 'text-slate-300' : 'text-slate-600'} font-baloo mt-2`} numberOfLines={2}>
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                </View>
                                                {item.characters && item.characters.length > 0 && (
                                                    <View className='flex flex-row flex-wrap gap-2 mt-2 mb-1'>
                                                        {item.characters.map((storyCharacter: any, charIndex: number) => {
                                                            const character = storyCharacter.character;
                                                            if (!character) return null;
                                                            return (
                                                                <View key={storyCharacter.id ?? `char-${charIndex}`} className='flex flex-row items-center gap-2 bg-white/90 rounded-xl px-3 py-2'>
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
                                                    <Text className={`${isNight ? 'text-white' : 'text-black'} text-base font-baloo-semibold ml-2`}>
                                                        {t('storyFolder.author')} : <Text className='font-baloo'>{item.user?.profil?.name || t('storyFolder.anonymous')}</Text>
                                                    </Text>
                                                    <View className='flex flex-row items-center gap-2'>
                                                        {item.language && (
                                                            <Text style={{ fontSize: 16 }}>{getLanguageFlag(item.language)}</Text>
                                                        )}
                                                        <View className="flex-row items-center gap-1 bg-slate-200 rounded-full px-2 py-0.5">
                                                            <Feather name="book-open" size={12} color="#64748b" />
                                                            <Text className="text-sm font-baloo-semibold text-slate-600 -mb-[2px]">{item.numberOfPages}</Text>
                                                        </View>
                                                        {item._count?.favoriteBy > 0 && (
                                                            <View className="flex-row items-center gap-1 bg-red-50 rounded-full px-2 py-0.5">
                                                                <Ionicons name="heart" size={12} color="#ef4444" />
                                                                <Text className="text-sm font-baloo-semibold text-red-500 -mb-[2px]">{item._count.favoriteBy}</Text>
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
