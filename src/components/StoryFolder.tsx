import React, { useState } from 'react';
import {
    View,
    Text,
    Dimensions,
    Pressable,
    LayoutChangeEvent,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

type StoryFolderProps = {
    title: string;
    icon?: React.ReactNode;
    storyType: string;
    description: string;
    stories: any[];
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StoryFolder({
    title,
    storyType,
    icon,
    description,
    stories,
}: StoryFolderProps) {
    const [expanded, setExpanded] = useState(false);
    const [layoutY, setLayoutY] = useState(0);

    const width = useSharedValue(SCREEN_WIDTH / 1.08);
    const height = useSharedValue(84);
    const translateY = useSharedValue(0);
    const navigation = useNavigation();

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
        if (expanded) {
            width.value = SCREEN_WIDTH / 1.08;
            height.value = 84;
            translateY.value = 0;
        } else {
            width.value = SCREEN_WIDTH;
            height.value = SCREEN_HEIGHT;
            translateY.value = -layoutY;
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

                <BlurView
                    intensity={expanded ? 60 : 30}
                    tint="light"
                    style={{ flex: 1, padding: 16, borderRadius: 24 }}
                >
                    <View
                        className="w-full mb-4 relative"
                        style={{ flex: expanded ? 1 : undefined }}
                    >
                        <Text className="text-slate-700 text-2xl font-bold">{title}</Text>
                        <Text className="text-slate-500 text-lg font-light">{description}</Text>

                        {expanded && (
                            <Pressable
                                onPress={handleToggle}
                                className="absolute top-0 right-0 p-2"
                            >
                                <Feather name="x" size={24} color="#fff" />
                            </Pressable>
                        )}

                        {stories.length === 0 ? (
                            <View className="flex-1 items-center  mt-6">
                                <Text className="text-gray-500 mb-4">Pas d'histoires créées.</Text>
                                <TouchableOpacity
                                    className="bg-white px-4 py-2 rounded-lg"
                                    onPress={() => navigation.navigate('CreateStory')}
                                >
                                    <Text className="font-semibold">Créer une Story</Text>
                                </TouchableOpacity>
                            </View>
                        ) : expanded ? (
                            <FlatList
                                data={stories}
                                keyExtractor={(item) => item.id.toString()}
                                style={{ flex: 1, marginTop: 16 }}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => {
                                    const firstPageImage = item.pages?.[0]?.imageUrl;

                                    return (
                                        <TouchableOpacity
                                            className="mb-2 p-4 bg-gray-100 rounded-3xl"
                                            onPress={() =>
                                                navigation.navigate('StoryDetail', { storyId: item.id })
                                            }
                                        >
                                            <Text className="text-lg font-medium mb-2">{item.title}</Text>

                                            {firstPageImage && (
                                                <Image
                                                    source={{ uri: firstPageImage }}
                                                    style={{ width: '100%', height: 150, borderRadius: 8 }}
                                                    resizeMode="cover"
                                                />
                                            )}
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
