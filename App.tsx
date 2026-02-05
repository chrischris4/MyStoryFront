import { ThemeProvider } from '~/context/ThemeContext';
import { AuthProvider } from '~/context/AuthContext';
import { SoundProvider } from '~/context/SoundContext';
import './global.css';

import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { initI18n } from '~/i18n';
import { useNotifications } from '~/hooks/useNotifications';

const queryClient = new QueryClient();

// Composant pour initialiser les notifications (doit être dans AuthProvider)
function NotificationHandler() {
  useNotifications();
  return null;
}

// Configuration personnalisée des toasts
const toastConfig = {
  success: (props: any) => (
    <View style={{ paddingHorizontal: 20, width: '100%' }}>
      <View
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          paddingVertical: 16,
          paddingHorizontal: 16,
          backgroundColor: '#ffffff',
          borderBlockColor: '#000000',
          borderWidth: 2,
          zIndex: 9999,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'Baloo2-Bold',
            textAlign: 'center',
            marginBottom: 4,
            color: '#000000',
          }}
        >
          {props.text1}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Baloo2-Regular',
            textAlign: 'center',
            color: '#000000',
          }}
        >
          {props.text2}
        </Text>
      </View>
    </View>
  ),
  error: (props: any) => (
    <View style={{ paddingHorizontal: 20, width: '100%' }}>
      <View
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          paddingVertical: 16,
          paddingHorizontal: 16,
          backgroundColor: '#ffffff',
          borderBlockColor: '#000000',
          borderWidth: 2,
          zIndex: 9999,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'Baloo2-Bold',
            textAlign: 'center',
            marginBottom: 4,
            color: '#000000',
          }}
        >
          {props.text1}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Baloo2-Regular',
            textAlign: 'center',
            color: '#000000',
          }}
        >
          {props.text2}
        </Text>
      </View>
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
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && i18nReady) {
      // Cacher le splash screen quand les fonts et i18n sont chargés
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, i18nReady]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!i18nReady) {
    return null;
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationHandler />
          <ThemeProvider>
            <SoundProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </SoundProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toast config={toastConfig} />
    </>
  );
}
