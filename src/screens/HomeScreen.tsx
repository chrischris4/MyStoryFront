import { View, Text, Image } from 'react-native';
import BottomNavBar from '~/navigation/BottomNavBar';

export default function HomeScreen() {

  return (
    <View className="flex-1 relative items-center justify-center bg-white w-full ">
      <Image
        source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
        className="w-24 h-24 rounded-full mb-4 border border-black"
      />
      <Text className="text-lg font-bold text-gray-800">Jean Dupont</Text>
      <BottomNavBar />
    </View>
  );
}
