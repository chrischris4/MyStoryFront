import { ThemeProvider } from '~/context/ThemeContext';
import { AuthProvider } from '~/context/AuthContext';
import './global.css';

import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <AuthProvider>
        <ThemeProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}
