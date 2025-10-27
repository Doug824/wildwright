/**
 * Chip Component - Small tag/badge for tags and abilities
 *
 * Used for displaying tags like "Beast Shape I", "Flanking", "Aquatic", etc.
 */

import { Text, View, ViewProps, StyleSheet } from 'react-native';

export interface ChipProps extends Omit<ViewProps, 'style'> {
  label: string;
  variant?: 'default' | 'mist' | 'forest' | 'disabled';
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 6,
  },
  default: {
    backgroundColor: '#2A4A3A', // Forest-600
    borderColor: '#B97A3D', // Bronze-500
  },
  mist: {
    backgroundColor: 'rgba(127, 201, 192, 0.35)', // Mist-500/35 - more solid
    borderColor: '#5C9F96', // Darker mist for better visibility
    borderWidth: 2,
  },
  forest: {
    backgroundColor: '#7FD1A8',
    borderColor: '#2A4A3A',
    borderWidth: 2,
  },
  disabled: {
    backgroundColor: '#E8DCC8',
    borderColor: '#C0B4A0',
    opacity: 0.6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textDefault: {
    color: '#F0E8D5', // Parchment-100
  },
  textMist: {
    color: '#1A0F08', // Almost black for better readability
  },
  textForest: {
    color: '#2A4A3A',
  },
  textDisabled: {
    color: '#6B5344',
  },
});

export function Chip({ label, variant = 'default', ...props }: ChipProps) {
  const getContainerStyle = () => {
    switch (variant) {
      case 'mist':
        return styles.mist;
      case 'forest':
        return styles.forest;
      case 'disabled':
        return styles.disabled;
      default:
        return styles.default;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'mist':
        return styles.textMist;
      case 'forest':
        return styles.textForest;
      case 'disabled':
        return styles.textDisabled;
      default:
        return styles.textDefault;
    }
  };

  return (
    <View
      style={[styles.container, getContainerStyle()]}
      {...props}
    >
      <Text style={[styles.text, getTextStyle()]}>
        {label}
      </Text>
    </View>
  );
}
