/**
 * GlowHalo Component - Wraps content with a magical glow effect
 *
 * Creates a soft, radial glow around any content.
 * Perfect for highlighting important elements.
 */

import { View, ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface GlowHaloProps extends ViewProps {
  children: React.ReactNode;
  color?: 'green' | 'cyan' | 'bronze';
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    borderRadius: 28,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

const colorMap = {
  green: ['rgba(127, 209, 168, 0.4)', 'transparent'],
  cyan: ['rgba(127, 201, 192, 0.4)', 'transparent'],
  bronze: ['rgba(185, 122, 61, 0.4)', 'transparent'],
};

export function GlowHalo({ children, color = 'green', style, ...props }: GlowHaloProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={colorMap[color]}
        style={styles.halo}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}
