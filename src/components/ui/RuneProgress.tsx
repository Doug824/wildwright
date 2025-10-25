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
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#5C9F96', // Darker mist for visibility
    backgroundColor: 'rgba(127, 201, 192, 0.25)', // Light mist background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7FC9C0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  text: {
    color: '#1A0F08', // Almost black for readability
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    color: '#E8DCC8', // Parchment-200
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
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
