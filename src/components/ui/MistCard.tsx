/**
 * MistCard Component - Frosted glass card with blur effect
 *
 * Semi-transparent card with a mystical misted appearance.
 * Perfect for overlays and floating UI elements.
 */

import { View, ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface MistCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(127, 201, 192, 0.5)', // Mist border
    // Soft glow
    shadowColor: '#7FC9C0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  innerGradient: {
    padding: 16,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export function MistCard({ children, intensity = 'medium', style, ...props }: MistCardProps) {
  // Adjust opacity based on intensity
  const opacities = {
    light: 0.3,
    medium: 0.5,
    heavy: 0.7,
  };

  const opacity = opacities[intensity];

  return (
    <View style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={[
          `rgba(233, 227, 210, ${opacity})`,
          `rgba(249, 245, 235, ${opacity - 0.1})`,
        ]}
        style={styles.innerGradient}
      >
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}
