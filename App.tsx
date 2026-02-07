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
import { Text, View, Platform } from 'react-native';
import { initI18n } from '~/i18n';
import { useNotifications } from '~/hooks/useNotifications';

const queryClient = new QueryClient();

// Composant pour initialiser les notifications (doit être dans AuthProvider)
function NotificationHandler() {
  useNotifications();
  return null;
}

// Configuration personnalisée des toasts - Style Bubbly / Playful
const toastConfig = {
  success: (props: any) => (
    <View style={{ paddingHorizontal: 16, width: '100%' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 24,
          paddingVertical: 14,
          paddingHorizontal: 20,
          backgroundColor: '#ECFDF5',
          borderWidth: 2,
          borderColor: '#6EE7B7',
          zIndex: 9999,
          ...Platform.select({
            ios: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
            android: { elevation: 8 },
          }),
        }}
      >
        <Text style={{ fontSize: 28, marginRight: 12 }}>
          {props.props?.emoji || '\u2728'}
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Baloo2-Bold',
              color: '#065F46',
              marginBottom: 2,
            }}
          >
            {props.text1}
          </Text>
          {props.text2 ? (
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Baloo2-Medium',
                color: '#37b350',
              }}
            >
              {props.text2}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  ),
  error: (props: any) => (
    <View style={{ paddingHorizontal: 16, width: '100%' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 24,
          paddingVertical: 14,
          paddingHorizontal: 20,
          backgroundColor: '#FEF2F2',
          borderWidth: 2,
          borderColor: '#FCA5A5',
          zIndex: 9999,
          ...Platform.select({
            ios: { shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
            android: { elevation: 8 },
          }),
        }}
      >
        <Text style={{ fontSize: 28, marginRight: 12 }}>
          {props.props?.emoji || '\uD83D\uDE25'}
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Baloo2-Bold',
              color: '#991B1B',
              marginBottom: 2,
            }}
          >
            {props.text1}
          </Text>
          {props.text2 ? (
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Baloo2-Medium',
                color: '#b33737',
              }}
            >
              {props.text2}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  ),
  info: (props: any) => (
    <View style={{ paddingHorizontal: 16, width: '100%' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 24,
          paddingVertical: 14,
          paddingHorizontal: 20,
          backgroundColor: '#EFF6FF',
          borderWidth: 2,
          borderColor: '#93C5FD',
          zIndex: 9999,
          ...Platform.select({
            ios: { shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
            android: { elevation: 8 },
          }),
        }}
      >
        <Text style={{ fontSize: 28, marginRight: 12 }}>
          {props.props?.emoji || '\uD83D\uDCD6'}
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Baloo2-Bold',
              color: '#1E3A5F',
              marginBottom: 2,
            }}
          >
            {props.text1}
          </Text>
          {props.text2 ? (
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Baloo2-Medium',
                color: '#5175db',
              }}
            >
              {props.text2}
            </Text>
          ) : null}
        </View>
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
