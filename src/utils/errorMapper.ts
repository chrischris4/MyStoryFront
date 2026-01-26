import { TFunction } from 'i18next';
import { ApiError } from '~/services/api';

/**
 * Map les codes d'erreur API vers les traductions i18n
 */
export const mapApiError = (error: unknown, t: TFunction): string => {
  if (error instanceof ApiError) {
    const code = error.data?.code;

    if (code) {
      // Vérifie si une traduction existe pour ce code
      const translationKey = `apiErrors.${code}`;
      const translation = t(translationKey);

      // Si la traduction existe (différente de la clé), on la retourne
      if (translation !== translationKey) {
        return translation;
      }
    }

    // Fallback sur le message de l'API
    return error.message || t('errors.unknownError');
  }

  return t('errors.unknownError');
};
