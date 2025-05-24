import { View, Text } from 'react-native';

export default function CreateStoryScreen() {
    return (
        <>
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-xl">Créer une Story ✍️</Text>
            </View>
            <View className="flex-1 items-center justify-center bg-white">
                <View className="border border-black p-2 rounded-xl">
                    <Text className="text-xl">Mes stories ✍️</Text>
                </View>    
                </View>
        </>
    );
}
