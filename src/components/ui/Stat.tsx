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
    color: '#D4C5A9', // Parchment-300
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  value: {
    color: '#F9F5EB', // Parchment-50
    fontSize: 24,
    fontWeight: '600',
  },
  sub: {
    color: '#D4C5A9', // Parchment-300
    fontSize: 12,
    marginTop: 2,
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
