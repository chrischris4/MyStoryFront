import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '~/screens/RegisterScreen';
import HomeScreen from '~/screens/HomeScreen';
import StoriesScreen from '~/screens/StoriesScreen';
import CreateStoryScreen from '~/screens/CreateStoryScreen';
import StoryDetailScreen from '~/screens/StoryDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Stories" component={StoriesScreen} />
                <Stack.Screen name="CreateStory" component={CreateStoryScreen} />
                <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
