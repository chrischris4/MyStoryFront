import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { api } from '~/services/api';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { mapApiError } from '~/utils/errorMapper';

// Nécessaire pour fermer la session web browser après l'auth
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';

export const useOAuth = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | null>(null);

  // Le client iOS génère automatiquement le redirect URI en reverse scheme :
  // com.googleusercontent.apps.{iOS_client_id}:/oauthredirect
  // Aucune config à ajouter dans Google Cloud Console.
  const [googleRequest, , googlePromptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID_WEB,
    androidClientId: GOOGLE_CLIENT_ID_WEB,
    redirectUri: 'https://auth.expo.io/@chris4/flun',
  });


  const handleOAuthLogin = async (
    provider: 'google',
    accessToken: string,
    userName?: string
  ) => {
    try {
      const data = await api.oauthLogin(provider, accessToken, userName);
      await login(data.accessToken, data.refreshToken);
      return true;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: mapApiError(error, t),
      });
      return false;
    }
  };

  const signInWithGoogle = async () => {
    console.log('[OAuth] redirectUri utilisé:', googleRequest?.redirectUri);
    if (!googleRequest) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.googleNotConfigured'),
        props: { emoji: '⚙️' },
      });
      return false;
    }

    setIsLoading(true);
    setLoadingProvider('google');

    try {
      const result = await googlePromptAsync();
      console.log('[OAuth] result type:', result.type);
      console.log('[OAuth] result complet:', JSON.stringify(result, null, 2));

      if (result.type === 'success' && result.authentication?.accessToken) {
        // Récupérer les infos utilisateur Google pour avoir le nom
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/userinfo/v2/me',
          {
            headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
          }
        );
        const userInfo = await userInfoResponse.json();

        return await handleOAuthLogin(
          'google',
          result.authentication.accessToken,
          userInfo.name
        );
      }

      if (result.type === 'cancel') {
        return false;
      }

      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.googleAuthFailed'),
      });
      return false;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: mapApiError(error, t),
      });
      return false;
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };


  return {
    signInWithGoogle,
    isLoading,
    loadingProvider,
    googleReady: !!googleRequest,
  };
};
