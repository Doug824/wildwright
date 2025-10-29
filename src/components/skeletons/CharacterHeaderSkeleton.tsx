/**
 * CharacterHeaderSkeleton Component - Loading placeholder for character header
 *
 * Skeleton loader for the welcome header on the home screen.
 */

import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    marginBottom: 8,
  },
});

/**
 * Skeleton placeholder for character header
 *
 * Displays animated loading state for the "Welcome back" header
 * with character name on the home screen.
 *
 * @example
 * ```tsx
 * {isLoading ? (
 *   <CharacterHeaderSkeleton />
 * ) : (
 *   <View style={styles.header}>
 *     <Text>Welcome back,</Text>
 *     <Text>{characterName}</Text>
 *   </View>
 * )}
 * ```
 */
export function CharacterHeaderSkeleton() {
  return (
    <View style={styles.header}>
      {/* "Welcome back" text */}
      <Skeleton
        width={120}
        height={18}
        borderRadius={4}
        style={styles.welcomeText}
      />

      {/* Character name */}
      <Skeleton
        width={200}
        height={32}
        borderRadius={6}
      />
    </View>
  );
}
