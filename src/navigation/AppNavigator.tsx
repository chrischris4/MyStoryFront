import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '~/screens/RegisterScreen';
import HomeScreen from '~/screens/HomeScreen';
import StoriesScreen from '~/screens/StoriesScreen';
import CreateStoryScreen from '~/screens/CreateStoryScreen';
import StoryDetailScreen from '~/screens/StoryDetailScreen';
import CompleteProfileScreen from '~/screens/CompleteProfileScreen';
import PurchaseScreen from '~/screens/PurchaseScreen';
import OpeningScreen from '~/screens/Opening';


export type RootStackParamList = {
    Opening: undefined;
    Login: undefined;
    Register: undefined;
    Home: undefined;
    Stories: undefined;
    CreateStory: undefined;
    StoryDetail: undefined;
    CompleteProfileScreen: { accessToken: string };
    PurchaseScreen: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Opening" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Opening" component={OpeningScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Stories" component={StoriesScreen} />
                <Stack.Screen name="CreateStory" component={CreateStoryScreen} />
                <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
                <Stack.Screen name="CompleteProfileScreen" component={CompleteProfileScreen} />
                <Stack.Screen name="PurchaseScreen" component={PurchaseScreen} />

            </Stack.Navigator>
        </NavigationContainer>
    );
}
