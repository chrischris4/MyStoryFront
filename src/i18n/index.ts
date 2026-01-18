import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from './locales/fr.json';
import en from './locales/en.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

const getStoredLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
};

export const setLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error setting language:', error);
  }
};

export const initI18n = async (): Promise<void> => {
  const storedLanguage = await getStoredLanguage();
  const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'fr';

  // Use stored language, or device language if supported, or fallback to French
  const defaultLanguage = storedLanguage || (deviceLanguage === 'en' ? 'en' : 'fr');

  await i18n.use(initReactI18next).init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'fr',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

export default i18n;
