/**
 * BarkCard Component - Card with bark-like organic texture
 *
 * A more organic, nature-inspired card with layered depth.
 * Uses semi-transparent overlays to create bark-like texture.
 */

import { View, ViewProps, StyleSheet } from 'react-native';

export interface BarkCardProps extends ViewProps {
  children: React.ReactNode;
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 20,
    overflow: 'hidden',
    // Outer glow
    shadowColor: '#6B9F7F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  barkTexture: {
    backgroundColor: '#5C4033', // Dark bark brown
    padding: 3,
    borderRadius: 20,
  },
  innerCard: {
    backgroundColor: '#E8DCC8', // Warm parchment
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#8B7355', // Deep brown
    padding: 16,
    // Subtle inner shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  // Organic texture overlay
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 115, 85, 0.06)',
    borderRadius: 17,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export function BarkCard({ children, style, ...props }: BarkCardProps) {
  return (
    <View style={[styles.outer, style]} {...props}>
      <View style={styles.barkTexture}>
        <View style={styles.innerCard}>
          <View style={styles.textureOverlay} />
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </View>
  );
}
