/**
 * Card Component - Ornate parchment card with decorative bronze borders
 *
 * The foundation of the WildWright UI - a beautiful parchment-style card
 * with ornate bronze borders, corner decorations, and dramatic shadows.
 */

import { View, ViewProps, StyleSheet } from 'react-native';

export interface CardProps extends ViewProps {}

const styles = StyleSheet.create({
  cardOuter: {
    position: 'relative',
    // Outer glow effect
    shadowColor: '#7FC9C0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  card: {
    backgroundColor: '#F0E8D5', // Parchment
    borderWidth: 3,
    borderColor: '#B97A3D', // Bronze
    borderRadius: 24,
    padding: 28,
    // Dramatic shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 16,
    position: 'relative',
  },
  cardInner: {
    borderWidth: 1,
    borderColor: 'rgba(185, 122, 61, 0.3)', // Semi-transparent bronze inner border
    borderRadius: 20,
    padding: 4,
    margin: -4,
  },
  cornerDecoration: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#D4A574', // Light bronze for decoration
    borderWidth: 2,
  },
  cornerTopLeft: {
    top: 8,
    left: 8,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 8,
    right: 8,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 8,
    left: 8,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 8,
    right: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
});

export function Card({ style, children, ...props }: CardProps) {
  return (
    <View style={styles.cardOuter}>
      <View style={[styles.card, style]} {...props}>
        {/* Decorative corner elements */}
        <View style={[styles.cornerDecoration, styles.cornerTopLeft]} />
        <View style={[styles.cornerDecoration, styles.cornerTopRight]} />
        <View style={[styles.cornerDecoration, styles.cornerBottomLeft]} />
        <View style={[styles.cornerDecoration, styles.cornerBottomRight]} />

        {/* Content with inner border */}
        <View style={styles.cardInner}>
          {children}
        </View>
      </View>
    </View>
  );
}
