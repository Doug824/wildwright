/**
 * AsyncStorage utilities for persisting app state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CURRENT_CHARACTER_ID: '@wildwright/currentCharacterId',
  CURRENT_USER_ID: '@wildwright/currentUserId',
} as const;

/**
 * Store the current character ID
 */
export async function setCurrentCharacterId(characterId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_CHARACTER_ID, characterId);
  } catch (error) {
    console.error('Error saving character ID:', error);
  }
}

/**
 * Get the current character ID
 */
export async function getCurrentCharacterId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_CHARACTER_ID);
  } catch (error) {
    console.error('Error getting character ID:', error);
    return null;
  }
}

/**
 * Store the current user ID
 */
export async function setCurrentUserId(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  } catch (error) {
    console.error('Error saving user ID:', error);
  }
}

/**
 * Get the current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

/**
 * Clear all stored data
 */
export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CURRENT_CHARACTER_ID,
      STORAGE_KEYS.CURRENT_USER_ID,
    ]);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}
