/**
 * RuneProgress Component - Circular runic progress indicator
 *
 * Displays daily uses with a mystical cyan glow effect.
 * Shows "X/Y" for finite uses or "X/∞" for infinite uses.
 */

import { View, Text, ViewProps, StyleSheet } from 'react-native';

export interface RuneProgressProps extends Omit<ViewProps, 'style'> {
  used: number;
  total: number | '∞';
  label?: string;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#7FC9C0', // Mist-500
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7FC9C0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  text: {
    color: '#7FC9C0', // Mist-300
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    color: '#E8DCC8', // Parchment-200
    fontSize: 12,
    marginTop: 4,
  },
});

export function RuneProgress({ used, total, label = 'Daily Uses', ...props }: RuneProgressProps) {
  return (
    <View style={styles.container} {...props}>
      <View style={styles.circle}>
        <Text style={styles.text}>
          {typeof total === 'number' ? `${used}/${total}` : `${used}/∞`}
        </Text>
      </View>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
    </View>
  );
}
