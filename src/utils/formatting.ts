/**
 * Formatting Utilities
 *
 * Functions for formatting text, numbers, dates, etc.
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert snake_case to Title Case
 */
export const snakeToTitle = (str: string): string => {
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format modifier with + or - sign
 */
export const formatModifier = (modifier: number): string => {
  if (modifier > 0) return `+${modifier}`;
  if (modifier < 0) return `${modifier}`;
  return '+0';
};

/**
 * Format ability score with modifier
 * Example: "16 (+3)"
 */
export const formatAbilityScore = (score: number, modifier: number): string => {
  return `${score} (${formatModifier(modifier)})`;
};

/**
 * Format dice roll
 * Example: "2d6+4"
 */
export const formatDiceRoll = (dice: string, modifier: number): string => {
  if (modifier === 0) return dice;
  return `${dice}${formatModifier(modifier)}`;
};

// ============================================================================
// DATE/TIME FORMATTING
// ============================================================================

/**
 * Convert Firestore Timestamp to Date
 */
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

/**
 * Format date as "Jan 15, 2025"
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date as "Jan 15, 2025 at 3:45 PM"
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  return formatDate(date);
};

// ============================================================================
// LIST FORMATTING
// ============================================================================

/**
 * Join array with commas and "and"
 * Example: ["a", "b", "c"] => "a, b, and c"
 */
export const formatList = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast}, and ${last}`;
};

/**
 * Format tags as comma-separated list
 */
export const formatTags = (tags: string[]): string => {
  return tags.join(', ');
};

// ============================================================================
// SIZE/UNIT FORMATTING
// ============================================================================

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format movement speed
 * Example: { land: 30, fly: 60 } => "30 ft., fly 60 ft."
 */
export const formatMovement = (movement: Record<string, number>): string => {
  const parts: string[] = [];

  if (movement.land) {
    parts.push(`${movement.land} ft.`);
  }

  Object.entries(movement).forEach(([type, speed]) => {
    if (type !== 'land' && speed) {
      parts.push(`${type} ${speed} ft.`);
    }
  });

  return parts.join(', ');
};

// ============================================================================
// PLURALIZATION
// ============================================================================

/**
 * Simple pluralization
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

/**
 * Format count with pluralized word
 * Example: formatCount(3, 'form') => "3 forms"
 */
export const formatCount = (count: number, singular: string, plural?: string): string => {
  return `${count} ${pluralize(count, singular, plural)}`;
};
