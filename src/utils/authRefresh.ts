import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '~/store/useUserStore';

let refreshTimeout: NodeJS.Timeout | null = null;

export const setupTokenRefresh = async () => {
  // Nettoyer l'ancien timeout
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  const accessToken = await AsyncStorage.getItem('accessToken');
  if (!accessToken) return;

  // Décoder le token pour obtenir l'expiration
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = payload.exp * 1000; // Convertir en ms
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Rafraîchir 2 minutes avant l'expiration
    const refreshTime = timeUntilExpiry - 2 * 60 * 1000;

    if (refreshTime > 0) {

      refreshTimeout = setTimeout(async () => {
        await refreshTokens();
      }, refreshTime);
    } else {
      // Token déjà expiré ou va expirer bientôt
      await refreshTokens();
    }
  } catch (error) {
    // console.error('Erreur lors du décodage du token:', error);
  }
};

const refreshTokens = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      // console.log('❌ Pas de refresh token disponible');
      return;
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.97:3000'}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();

      // Mettre à jour AsyncStorage
      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);

      // Mettre à jour le store Zustand (important pour que l'API utilise le nouveau token)
      useUserStore.getState().setTokens(newAccessToken, newRefreshToken);

      // Programmer le prochain refresh
      setupTokenRefresh();
    } else {
      const errorText = await response.text();
      // console.error('❌ Échec du rafraîchissement du token');
      // console.error('Status:', response.status);
      // console.error('Réponse:', errorText);
      // Déconnecter l'utilisateur
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
    }
  } catch (error) {
    console.error('❌ Erreur lors du rafraîchissement:', error);
  }
};

export const clearTokenRefresh = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
};
