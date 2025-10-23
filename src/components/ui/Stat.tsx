/**
 * Stat Component - Display a labeled stat value
 *
 * Shows a stat label, primary value, and optional subtitle.
 * Used for HP, AC, Saves, Speed, etc.
 */

import { View, Text, ViewProps, StyleSheet } from 'react-native';

export interface StatProps extends Omit<ViewProps, 'style'> {
  label: string;
  value: string | number;
  sub?: string;
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    marginBottom: 12,
  },
  label: {
    color: '#4A3426', // Dark brown for readability
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  value: {
    color: '#1A0F08', // Almost black for maximum readability
    fontSize: 24,
    fontWeight: '700',
  },
  sub: {
    color: '#2C1810', // Dark brown
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
});

export function Stat({ label, value, sub, ...props }: StatProps) {
  return (
    <View style={styles.container} {...props}>
      <Text style={styles.label}>
        {label}
      </Text>
      <Text style={styles.value}>
        {value}
      </Text>
      {sub && (
        <Text style={styles.sub}>
          {sub}
        </Text>
      )}
    </View>
  );
}
