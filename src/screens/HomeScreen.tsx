import { View, Text, Image } from 'react-native';
import HomeButton from '~/components/HomeButton';
import StyledButton from '~/components/StyledButton';
import BottomNavBar from '~/navigation/BottomNavBar';
import { Feather } from '@expo/vector-icons';


export default function HomeScreen() {

  return (
    <View className="flex-1 relative items-center bg-[#ffffff] w-full ">
      <View className='flex flex-row mt-8 w-11/12 items-center'>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
          className="w-24 h-24 rounded-full"
        />
        <View className='flex flex-col ml-4'>
          <Text className="text-lg font-bold text-slate-700">Jean</Text>
          <Text className="text-lg font-light text-slate-700">Dupont</Text>
        </View>
      </View>
      <View className="gap-4 flex flex-row w-11/12 my-4">
        <StyledButton title="Créer une histoire" icon={<Feather name="plus" size={24} color="#fff" />}/>
        <StyledButton title="Modifier le profil" icon={<Feather name="edit-3" size={24} color="#fff" />} />
      </View>
      <View className='flex flex-col gap-4 w-11/12'>
        <HomeButton onPress={undefined} title="Mes histoires" description="Laissez parler votre imagination" icon={<Feather name="book" size={24} color="#334155" />}  />
        <HomeButton onPress={undefined} title="Créer une histoire" description="Laissez parler votre imagination" icon={<Feather name="users" size={24} color="#334155" />}  />
      </View>
      <BottomNavBar />
    </View>
  );
}
