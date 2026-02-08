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

// Configuration Google - À remplacer par tes vrais IDs
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';


export const useOAuth = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | null>(null);

  // Configuration Google
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID_WEB,
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
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
    if (!googleRequest) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.googleNotConfigured'),
      });
      return false;
    }

    setIsLoading(true);
    setLoadingProvider('google');

    try {
      const result = await googlePromptAsync();

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
