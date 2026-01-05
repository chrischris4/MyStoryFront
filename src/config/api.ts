// Configuration de l'API
export const API_BASE_URL = 'http://192.168.1.95:3000';

// Endpoints
export const API_ENDPOINTS = {
  STORIES: `${API_BASE_URL}/story`,
  CREATE_STORY: `${API_BASE_URL}/story/create`,
  FAVORITE_STORIES: `${API_BASE_URL}/favorite-story/me`,
  PROFILE_ME: `${API_BASE_URL}/profile/me`,
} as const;
