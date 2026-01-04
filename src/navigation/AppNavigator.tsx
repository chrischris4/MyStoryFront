import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '~/screens/RegisterScreen';
import HomeScreen from '~/screens/HomeScreen';
import StoriesScreen from '~/screens/StoriesScreen';
import SharedStoriesScreen from '~/screens/SharedStoriesScreen';
import CreateStoryScreen from '~/screens/CreateStoryScreen';
import StoryDetailScreen from '~/screens/StoryDetailScreen';
import CompleteProfileScreen from '~/screens/CompleteProfileScreen';
import OpeningScreen from '~/screens/Opening';
import BillingScreen from '~/screens/BillingScreen';
import SettingsScreen from '~/screens/SettingsScreen';


export type RootStackParamList = {
    BillingScreen: undefined;
    Opening: undefined;
    Login: undefined;
    Register: undefined;
    Home: undefined;
    Stories: undefined;
    SharedStories: undefined;
    CreateStory: undefined;
    StoryDetail: undefined;
    CompleteProfileScreen: { accessToken: string };
    SettingsScreen: undefined;

};


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Opening" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Opening" component={OpeningScreen} />
                <Stack.Screen name="BillingScreen" component={BillingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Stories" component={StoriesScreen} />
                <Stack.Screen name="SharedStories" component={SharedStoriesScreen} />
                <Stack.Screen name="CreateStory" component={CreateStoryScreen} />
                <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
                <Stack.Screen name="CompleteProfileScreen" component={CompleteProfileScreen} />
                <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
