import { View, Text, Image } from 'react-native';
import HomeButton from '~/components/HomeButton';
import BottomNavBar from '~/navigation/BottomNavBar';

export default function HomeScreen() {

  return (
    <View className="flex-1 relative items-center bg-blue-100 w-full ">
      <View className='py-10 flex flex-col items-center bg-blue-200 w-full mb-4'>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
          className="w-52 h-52 rounded-full mb-4"
        />
        <Text className="text-lg font-bold text-slate-700">Jean Dupont</Text>

      </View>
        <View className='flex flex-col gap-2 w-11/12'>
          <HomeButton onPress={undefined} title="Mes histoires" />
          <HomeButton onPress={undefined} title="Créer une histoire" />
        </View>
      <BottomNavBar />
    </View>
  );
}
