import { ThemeProvider } from '~/context/ThemeContext';
import { AuthProvider } from '~/context/AuthContext';
import './global.css';

import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { Text, View } from 'react-native';

const queryClient = new QueryClient();

// Configuration personnalisée des toasts
const toastConfig = {
  success: (props: any) => (
    <View style={{ paddingHorizontal: 20, width: '100%' }}>
      <BlurView
        intensity={90}
        tint="light"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          paddingVertical: 20,
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'Baloo2-Bold',
            textAlign: 'center',
            marginBottom: 4,
            color: '#1F2937',
          }}
        >
          {props.text1}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Baloo2-Regular',
            textAlign: 'center',
            color: '#4B5563',
          }}
        >
          {props.text2}
        </Text>
      </BlurView>
    </View>
  ),
  error: (props: any) => (
    <View style={{ paddingHorizontal: 20, width: '100%' }}>
      <BlurView
        intensity={90}
        tint="light"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          paddingVertical: 20,
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'Baloo2-Bold',
            textAlign: 'center',
            marginBottom: 4,
            color: '#DC2626',
          }}
        >
          {props.text1}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Baloo2-Regular',
            textAlign: 'center',
            color: '#991B1B',
          }}
        >
          {props.text2}
        </Text>
      </BlurView>
    </View>
  ),
};

// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Baloo2-Regular': require('./assets/fonts/Baloo2-Regular.ttf'),
    'Baloo2-Medium': require('./assets/fonts/Baloo2-Medium.ttf'),
    'Baloo2-SemiBold': require('./assets/fonts/Baloo2-SemiBold.ttf'),
    'Baloo2-Bold': require('./assets/fonts/Baloo2-Bold.ttf'),
    'Baloo2-ExtraBold': require('./assets/fonts/Baloo2-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Cacher le splash screen quand les fonts sont chargées
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toast config={toastConfig} />
    </>
  );
}
