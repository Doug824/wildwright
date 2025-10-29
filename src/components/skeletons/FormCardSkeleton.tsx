/**
 * FormCardSkeleton Component - Loading placeholder for form cards
 *
 * Skeleton loader that matches the WildShape form card layout.
 */

import { View, StyleSheet } from 'react-native';
import { BarkCard } from '@/components/ui/BarkCard';
import { Skeleton } from '@/components/ui/Skeleton';

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});

/**
 * Skeleton placeholder for WildShape form cards
 *
 * Displays animated loading state matching form card layout with
 * title, subtitle, chips, and action buttons.
 *
 * @example
 * ```tsx
 * {isLoading && (
 *   <>
 *     <FormCardSkeleton />
 *     <FormCardSkeleton />
 *   </>
 * )}
 * ```
 */
export function FormCardSkeleton() {
  return (
    <BarkCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          {/* Form name */}
          <Skeleton width="70%" height={24} borderRadius={6} style={{ marginBottom: 8 }} />

          {/* Form subtitle (size, CR) */}
          <Skeleton width="50%" height={16} borderRadius={4} />
        </View>

        {/* Favorite button */}
        <Skeleton width={48} height={48} borderRadius={8} />
      </View>

      {/* Chips row (size, tier tags) */}
      <View style={styles.chipRow}>
        <Skeleton width={60} height={28} borderRadius={14} />
        <Skeleton width={80} height={28} borderRadius={14} />
        <Skeleton width={70} height={28} borderRadius={14} />
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Skeleton width="48%" height={44} borderRadius={8} />
        <Skeleton width="48%" height={44} borderRadius={8} />
      </View>
    </BarkCard>
  );
}
