/**
 * Haptics Utility
 *
 * Wrapper around expo-haptics with safe error handling.
 * Provides haptic feedback for key user interactions.
 */

import * as Haptics from 'expo-haptics';

/**
 * Light impact haptic (for button taps, selections)
 */
export const lightImpact = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Silently fail on platforms that don't support haptics
    console.debug('Haptics not supported', error);
  }
};

/**
 * Medium impact haptic (for important actions)
 */
export const mediumImpact = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.debug('Haptics not supported', error);
  }
};

/**
 * Heavy impact haptic (for major actions like form assumption)
 */
export const heavyImpact = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.debug('Haptics not supported', error);
  }
};

/**
 * Success notification (for successful operations)
 */
export const success = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.debug('Haptics not supported', error);
  }
};

/**
 * Warning notification (for confirmations)
 */
export const warning = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.debug('Haptics not supported', error);
  }
};

/**
 * Error notification (for errors and deletions)
 */
export const error = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.debug('Haptics not supported', error);
  }
};

/**
 * Selection change (for switches, toggles)
 */
export const selectionChange = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.debug('Haptics not supported', error);
  }
};
