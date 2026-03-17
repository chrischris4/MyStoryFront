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

  const signInWithGoogle = async (): Promise<{ success: false } | { success: true; isNewUser: boolean; accessToken: string; refreshToken: string }> => {
    setIsLoading(true);
    setLoadingProvider('google');

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      if (!tokens.accessToken) {
        Toast.show({ type: 'error', text1: t('common.error'), text2: t('auth.googleAuthFailed') });
        return { success: false };
      }

      const data = await api.oauthLogin('google', tokens.accessToken, userInfo.data?.user?.name ?? undefined);

      if (!data.isNewUser) {
        await login(data.accessToken, data.refreshToken);
      }

      return { success: true, isNewUser: data.isNewUser, accessToken: data.accessToken, refreshToken: data.refreshToken };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false };
      }
      Toast.show({ type: 'error', text1: t('common.error'), text2: mapApiError(error, t) });
      return { success: false };
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
