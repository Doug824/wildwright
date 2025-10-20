/**
 * Validation Utilities
 *
 * Functions for validating user input and data.
 */

import { VALIDATION } from '@/constants';

// ============================================================================
// STRING VALIDATION
// ============================================================================

/**
 * Check if string is empty or only whitespace
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * Validate character name
 */
export const validateCharacterName = (name: string): string | null => {
  if (isEmpty(name)) {
    return 'Character name is required';
  }

  if (name.length < VALIDATION.CHARACTER_NAME.MIN_LENGTH) {
    return `Character name must be at least ${VALIDATION.CHARACTER_NAME.MIN_LENGTH} character`;
  }

  if (name.length > VALIDATION.CHARACTER_NAME.MAX_LENGTH) {
    return `Character name must be at most ${VALIDATION.CHARACTER_NAME.MAX_LENGTH} characters`;
  }

  return null; // Valid
};

/**
 * Validate form name
 */
export const validateFormName = (name: string): string | null => {
  if (isEmpty(name)) {
    return 'Form name is required';
  }

  if (name.length < VALIDATION.FORM_NAME.MIN_LENGTH) {
    return `Form name must be at least ${VALIDATION.FORM_NAME.MIN_LENGTH} character`;
  }

  if (name.length > VALIDATION.FORM_NAME.MAX_LENGTH) {
    return `Form name must be at most ${VALIDATION.FORM_NAME.MAX_LENGTH} characters`;
  }

  return null; // Valid
};

/**
 * Validate notes field
 */
export const validateNotes = (notes: string): string | null => {
  if (notes.length > VALIDATION.NOTES.MAX_LENGTH) {
    return `Notes must be at most ${VALIDATION.NOTES.MAX_LENGTH} characters`;
  }

  return null; // Valid
};

/**
 * Validate display name
 */
export const validateDisplayName = (name: string): string | null => {
  if (isEmpty(name)) {
    return 'Display name is required';
  }

  if (name.length < VALIDATION.DISPLAY_NAME.MIN_LENGTH) {
    return `Display name must be at least ${VALIDATION.DISPLAY_NAME.MIN_LENGTH} character`;
  }

  if (name.length > VALIDATION.DISPLAY_NAME.MAX_LENGTH) {
    return `Display name must be at most ${VALIDATION.DISPLAY_NAME.MAX_LENGTH} characters`;
  }

  return null; // Valid
};

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | null => {
  if (isEmpty(email)) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  return null; // Valid
};

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Validate password
 */
export const validatePassword = (password: string): string | null => {
  if (isEmpty(password)) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null; // Valid
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmation: string
): string | null => {
  if (isEmpty(confirmation)) {
    return 'Password confirmation is required';
  }

  if (password !== confirmation) {
    return 'Passwords do not match';
  }

  return null; // Valid
};

// ============================================================================
// NUMBER VALIDATION
// ============================================================================

/**
 * Validate number is within range
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Value'
): string | null => {
  if (value < min) {
    return `${fieldName} must be at least ${min}`;
  }

  if (value > max) {
    return `${fieldName} must be at most ${max}`;
  }

  return null; // Valid
};

/**
 * Validate ability score (1-99)
 */
export const validateAbilityScore = (score: number): string | null => {
  return validateNumberRange(score, 1, 99, 'Ability score');
};

/**
 * Validate level (1-20)
 */
export const validateLevel = (level: number): string | null => {
  return validateNumberRange(level, 1, 20, 'Level');
};

// ============================================================================
// IMAGE VALIDATION
// ============================================================================

/**
 * Validate image file size
 */
export const validateImageSize = (sizeInBytes: number, maxSizeMB: number): string | null => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (sizeInBytes > maxSizeBytes) {
    return `Image must be smaller than ${maxSizeMB}MB`;
  }

  return null; // Valid
};

/**
 * Validate image file type
 */
export const validateImageType = (mimeType: string): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(mimeType.toLowerCase())) {
    return 'Image must be JPEG, PNG, or WebP format';
  }

  return null; // Valid
};
