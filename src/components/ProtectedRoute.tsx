import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '~/context/AuthContext';
import LottieView from 'lottie-react-native';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Rediriger vers Login si non authentifié
      navigation.navigate('Login' as never);
    }
  }, [isAuthenticated, isLoading, navigation]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LottieView
          source={require('../../assets/animations/LoadingWhite.json')}
          autoPlay
          loop={true}
          style={{ width: 100, height: 100 }}
        />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Le useEffect redirige déjà
  }

  return <>{children}</>;
}
