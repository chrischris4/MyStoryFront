import { useState, useEffect } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import { api } from '~/services/api';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { mapApiError } from '~/utils/errorMapper';

const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';

export const useOAuth = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID_WEB,
    });
  }, []);

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
    setIsLoading(true);
    setLoadingProvider('google');

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      if (tokens.accessToken) {
        return await handleOAuthLogin(
          'google',
          tokens.accessToken,
          userInfo.data?.user?.name ?? undefined
        );
      }

      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('auth.googleAuthFailed'),
      });
      return false;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return false;
      }
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
    googleReady: true,
  };
};
