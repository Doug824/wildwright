/**
 * App Constants
 *
 * General application constants and configuration.
 */

// ============================================================================
// APP INFO
// ============================================================================

export const APP_NAME = 'WildWright';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Wild Shape Tracker for Pathfinder and D&D';

// ============================================================================
// THEME
// ============================================================================

export const THEME_MODES = ['light', 'dark'] as const;
export const DEFAULT_THEME = 'dark';

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_AUTO_RESET_TIME = '04:00'; // 4:00 AM
export const DEFAULT_VIEW = 'cards' as const;

// ============================================================================
// LIMITS
// ============================================================================

export const MAX_CHARACTERS = 10; // Per user
export const MAX_FORMS_PER_CHARACTER = 50;
export const MAX_CUSTOM_FORMS = 100; // Total custom forms per user
export const MAX_IMAGE_SIZE_MB = 5; // Maximum image upload size

// ============================================================================
// VALIDATION
// ============================================================================

export const VALIDATION = {
  CHARACTER_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
  FORM_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
  NOTES: {
    MAX_LENGTH: 500,
  },
  DISPLAY_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 30,
  },
} as const;

// ============================================================================
// QUERY KEYS (for TanStack Query)
// ============================================================================

export const QUERY_KEYS = {
  USER: 'user',
  CHARACTERS: 'characters',
  CHARACTER: 'character',
  WILD_SHAPE_FORMS: 'wildShapeForms',
  WILD_SHAPE_FORM: 'wildShapeForm',
  WILD_SHAPE_TEMPLATES: 'wildShapeTemplates',
  WILD_SHAPE_TEMPLATE: 'wildShapeTemplate',
} as const;

// ============================================================================
// STORAGE PATHS
// ============================================================================

export const STORAGE_PATHS = {
  FORM_IMAGES: (userId: string, formId: string) => `users/${userId}/forms/${formId}`,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'You must be logged in to perform this action.',
  PERMISSION_DENIED: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  INVALID_DATA: 'Invalid data provided.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  CHARACTER_CREATED: 'Character created successfully!',
  CHARACTER_UPDATED: 'Character updated successfully!',
  CHARACTER_DELETED: 'Character deleted successfully!',
  FORM_CREATED: 'Wild shape form created successfully!',
  FORM_UPDATED: 'Wild shape form updated successfully!',
  FORM_DELETED: 'Wild shape form deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const;
