/**
 * Chip Component - Small tag/badge for tags and abilities
 *
 * Used for displaying tags like "Beast Shape I", "Flanking", "Aquatic", etc.
 */

import { Text, View, ViewProps, StyleSheet } from 'react-native';

export interface ChipProps extends Omit<ViewProps, 'style'> {
  label: string;
  variant?: 'default' | 'mist';
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  default: {
    backgroundColor: '#2A4A3A', // Forest-600
    borderColor: '#B97A3D', // Bronze-500
  },
  mist: {
    backgroundColor: 'rgba(127, 201, 192, 0.2)', // Mist-500/20
    borderColor: '#7FC9C0', // Mist-500
  },
  text: {
    fontSize: 12,
  },
  textDefault: {
    color: '#F0E8D5', // Parchment-100
  },
  textMist: {
    color: '#7FC9C0', // Mist-300
  },
});

export function Chip({ label, variant = 'default', ...props }: ChipProps) {
  return (
    <View
      style={[
        styles.container,
        variant === 'mist' ? styles.mist : styles.default,
      ]}
      {...props}
    >
      <Text style={[
        styles.text,
        variant === 'mist' ? styles.textMist : styles.textDefault,
      ]}>
        {label}
      </Text>
    </View>
  );
}
