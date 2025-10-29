/**
 * TemplateCardSkeleton Component - Loading placeholder for template cards
 *
 * Skeleton loader for wild shape template cards in the library.
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
 * Skeleton placeholder for template cards in library
 *
 * Matches the template card layout with title, subtitle,
 * chips, and action buttons.
 *
 * @example
 * ```tsx
 * {isLoading && (
 *   <>
 *     <TemplateCardSkeleton />
 *     <TemplateCardSkeleton />
 *     <TemplateCardSkeleton />
 *   </>
 * )}
 * ```
 */
export function TemplateCardSkeleton() {
  return (
    <BarkCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          {/* Template name */}
          <Skeleton width="75%" height={24} borderRadius={6} style={{ marginBottom: 8 }} />

          {/* Template subtitle (animal type, CR) */}
          <Skeleton width="60%" height={16} borderRadius={4} />
        </View>
      </View>

      {/* Chips row (size, CR, type tags) */}
      <View style={styles.chipRow}>
        <Skeleton width={65} height={28} borderRadius={14} />
        <Skeleton width={50} height={28} borderRadius={14} />
        <Skeleton width={75} height={28} borderRadius={14} />
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Skeleton width="100%" height={44} borderRadius={8} />
      </View>
    </BarkCard>
  );
}
