/**
 * Card Component - Epic Druidic Torn Parchment Card
 *
 * Inspired by ancient forest magic and weathered tomes.
 * Features torn edges, vine decorations, magical glows, and rich depth.
 */

import { View, ViewProps, StyleSheet } from 'react-native';

export interface CardProps extends ViewProps {}

const styles = StyleSheet.create({
  // Outer container with magical glow
  cardOuter: {
    position: 'relative',
    // Magical glow effect (ethereal green)
    shadowColor: '#6B9F7F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
  },
  // Main card body
  card: {
    backgroundColor: '#E8DCC8', // Warm aged parchment
    borderWidth: 0, // No border - we'll use decorative elements
    borderRadius: 8,
    padding: 20,
    // Dramatic shadow for depth (card floating above surface)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 20,
    position: 'relative',
    // Simulate torn/organic edges with overflow
    overflow: 'hidden',
  },
  // Aged parchment texture overlay
  parchmentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 115, 85, 0.05)', // Subtle brown texture
    borderRadius: 8,
  },
  // Inner border with organic feel
  cardInner: {
    borderWidth: 2,
    borderColor: '#8B7355', // Deep brown inner border
    borderRadius: 6,
    padding: 8,
    margin: -6,
    position: 'relative',
  },
  // Decorative vine corner elements
  vineCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  vineTopLeft: {
    top: -8,
    left: -8,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: '#5C7A5E', // Moss green vine
    borderTopLeftRadius: 20,
    // Add organic curve
    transform: [{ rotate: '-5deg' }],
  },
  vineTopRight: {
    top: -8,
    right: -8,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderColor: '#5C7A5E',
    borderTopRightRadius: 20,
    transform: [{ rotate: '5deg' }],
  },
  vineBottomLeft: {
    bottom: -8,
    left: -8,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#5C7A5E',
    borderBottomLeftRadius: 20,
    transform: [{ rotate: '5deg' }],
  },
  vineBottomRight: {
    bottom: -8,
    right: -8,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#5C7A5E',
    borderBottomRightRadius: 20,
    transform: [{ rotate: '-5deg' }],
  },
  // Magical energy line accents
  energyLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#7FD1A8',
    opacity: 0.4,
    shadowColor: '#7FD1A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  energyTop: {
    top: 4,
    left: 60,
    right: 60,
  },
  energyBottom: {
    bottom: 4,
    left: 60,
    right: 60,
  },
  // Content container
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export function Card({ style, children, ...props }: CardProps) {
  return (
    <View style={styles.cardOuter}>
      <View style={[styles.card, style]} {...props}>
        {/* Parchment texture overlay */}
        <View style={styles.parchmentOverlay} />

        {/* Vine corner decorations */}
        <View style={[styles.vineCorner, styles.vineTopLeft]} />
        <View style={[styles.vineCorner, styles.vineTopRight]} />
        <View style={[styles.vineCorner, styles.vineBottomLeft]} />
        <View style={[styles.vineCorner, styles.vineBottomRight]} />

        {/* Magical energy lines */}
        <View style={[styles.energyLine, styles.energyTop]} />
        <View style={[styles.energyLine, styles.energyBottom]} />

        {/* Content with inner border */}
        <View style={styles.cardInner}>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </View>
  );
}
