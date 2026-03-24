import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '~/screens/RegisterScreen';
import ForgotPasswordScreen from '~/screens/ForgotPasswordScreen';
import HomeScreen from '~/screens/HomeScreen';
import StoriesScreen from '~/screens/StoriesScreen';
import SharedStoriesScreen from '~/screens/SharedStoriesScreen';
import CreateStoryScreen from '~/screens/CreateStoryScreen';
import StoryDetailScreen from '~/screens/StoryDetailScreen';
import CompleteProfileScreen from '~/screens/CompleteProfileScreen';
import OpeningScreen from '~/screens/Opening';
import BillingScreen from '~/screens/BillingScreen';
import SettingsScreen from '~/screens/SettingsScreen';
import GroupScreen from '~/screens/GroupScreen';
import ProtectedRoute from '~/components/ProtectedRoute';
import BottomNavBar from '~/navigation/BottomNavBar';
import FloatingStoryCreation from '~/components/FloatingStoryCreation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '~/context/AuthContext';
import { api } from '~/services/api';
import * as NavigationBar from 'expo-navigation-bar';
import type { RootStackParamList, MainTabParamList } from '~/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator avec BottomNavBar personnalisée
function MainTabs() {
    const { bottom: bottomInset } = useSafeAreaInsets();
    const TAB_BAR_HEIGHT = 64;

    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <BottomNavBar {...props} />}
            sceneContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + Math.max(bottomInset, 8) }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Stories" component={StoriesScreen} />
            <Tab.Screen name="SharedStories" component={SharedStoriesScreen} />
            <Tab.Screen name="CreateStory" component={CreateStoryScreen} />
            <Tab.Screen name="SettingsScreen" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

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
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

            {/* Routes protégées avec Tab Navigator */}
            <Stack.Screen name="MainTabs">
                {(props) => (
                    <ProtectedRoute>
                        <MainTabs {...props} />
                    </ProtectedRoute>
                )}
            </Stack.Screen>

            {/* Pages modales/détails sans navbar */}
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
            <Stack.Screen name="GroupScreen">
                {(props) => (
                    <ProtectedRoute>
                        <GroupScreen {...props} />
                    </ProtectedRoute>
                )}
            </Stack.Screen>
            <Stack.Screen name="CompleteProfileScreen" component={CompleteProfileScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setPositionAsync('absolute');
            NavigationBar.setBackgroundColorAsync('#00000000');
        }
    }, []);

    return (
        <NavigationContainer>
            <AppNavigatorContent />
            <FloatingStoryCreation />
        </NavigationContainer>
    );
}
