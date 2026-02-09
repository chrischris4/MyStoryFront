import filter from 'leo-profanity';
import * as Yup from 'yup';

// French profanity words
const frenchProfanity = [
  'merde', 'putain', 'connard', 'connasse', 'salaud', 'salope',
  'enculé', 'enculer', 'nique', 'niquer', 'ntm', 'ntm',
  'batard', 'bâtard', 'pute', 'bordel', 'foutre',
  'bite', 'couille', 'couilles', 'chier', 'cul',
  'pd', 'pédé', 'pédale', 'gouine', 'tapette',
  'negro', 'nègre', 'négro', 'bougnoule', 'youpin',
  'fdp', 'tg', 'ta gueule', 'ferme ta gueule',
  'encule', 'enculée', 'pétasse', 'pouffiasse',
  'branleur', 'branleuse', 'abruti', 'abrutie',
  'trouduc', 'trou du cul', 'fils de pute',
  'sac à merde', 'bouffon', 'bouffonne',
  'clochard', 'clocharde', 'débile',
  'crétin', 'crétine', 'imbécile',
  'con', 'conne',
];

// Load default English dictionary then add French words
filter.loadDictionary('en');
filter.add(frenchProfanity);

/**
 * Check if a string contains profanity
 */
export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  return filter.check(text);
};

/**
 * Yup test for profanity - use with .test() in Yup schemas
 */
export const noProfanityTest = (errorMessage: string) =>
  Yup.string().test(
    'no-profanity',
    errorMessage,
    (value) => !value || !filter.check(value),
  );

/**
 * Add the profanity test to an existing Yup string schema
 */
export const addProfanityTest = (
  schema: Yup.StringSchema,
  errorMessage: string,
): Yup.StringSchema =>
  schema.test(
    'no-profanity',
    errorMessage,
    (value) => !value || !filter.check(value),
  );
