import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
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
import ProtectedRoute from '~/components/ProtectedRoute';
import { useAuth } from '~/context/AuthContext';
import { api } from '~/services/api';


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

function AppNavigatorContent() {
    const { logout, isAuthenticated } = useAuth();

    useEffect(() => {
        // Configurer le gestionnaire de déconnexion automatique en cas de 401
        api.setUnauthorizedHandler(() => {
            logout();
        });
    }, [logout]);

    return (
        <Stack.Navigator
            initialRouteName="Opening"
            screenOptions={{ headerShown: false }}
        >
            {/* Routes publiques */}
            <Stack.Screen name="Opening" component={OpeningScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* Routes protégées */}
            <Stack.Screen name="Home">
                {(props) => (
                    <ProtectedRoute>
                        <HomeScreen {...props} />
                    </ProtectedRoute>
                )}
            </Stack.Screen>
            <Stack.Screen name="Stories">
                {(props) => (
                    <ProtectedRoute>
                        <StoriesScreen {...props} />
                    </ProtectedRoute>
                )}
            </Stack.Screen>
            <Stack.Screen name="SharedStories">
                {(props) => (
                    <ProtectedRoute>
                        <SharedStoriesScreen {...props} />
                    </ProtectedRoute>
                )}
            </Stack.Screen>
            <Stack.Screen name="CreateStory">
                {(props) => (
                    <ProtectedRoute>
                        <CreateStoryScreen {...props} />
                    </ProtectedRoute>
                )}
            </Stack.Screen>
            <Stack.Screen name="StoryDetail">
                {(props) => (
                    <ProtectedRoute>
                        <StoryDetailScreen {...props} />
                    </ProtectedRoute>
                )}
            </Stack.Screen>
            <Stack.Screen name="BillingScreen">
                {(props) => (
                    <ProtectedRoute>
                        <BillingScreen {...props} />
                    </ProtectedRoute>
                )}
            </Stack.Screen>
            <Stack.Screen name="SettingsScreen">
                {(props) => (
                    <ProtectedRoute>
                        <SettingsScreen {...props} />
                    </ProtectedRoute>
                )}
            </Stack.Screen>
            <Stack.Screen name="CompleteProfileScreen" component={CompleteProfileScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <AppNavigatorContent />
        </NavigationContainer>
    );
}
