/**
 * Heading Components - Display typography for the WildWright UI
 *
 * Beautiful serif headings with epic glow effects.
 */

import { Text, TextProps, StyleSheet } from 'react-native';

export interface HeadingProps extends TextProps {}

const styles = StyleSheet.create({
  h1: {
    color: '#F9F5EB', // Parchment-50
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: '#7FC9C0',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  h2: {
    color: '#F9F5EB', // Parchment-50
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 0.8,
    textAlign: 'center',
    textShadowColor: '#7FC9C0',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  h3: {
    color: '#F0E8D5', // Parchment-100
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  h4: {
    color: '#F0E8D5', // Parchment-100
    fontSize: 18,
    fontWeight: '500',
  },
});

/**
 * H1 - Large display heading with cyan glow
 */
export function H1({ style, ...props }: HeadingProps) {
  return (
    <Text
      style={[styles.h1, style]}
      {...props}
    />
  );
}

/**
 * H2 - Section heading with cyan glow
 */
export function H2({ style, ...props }: HeadingProps) {
  return (
    <Text
      style={[styles.h2, style]}
      {...props}
    />
  );
}

/**
 * H3 - Subsection heading
 */
export function H3({ style, ...props }: HeadingProps) {
  return (
    <Text
      style={[styles.h3, style]}
      {...props}
    />
  );
}

/**
 * H4 - Small heading
 */
export function H4({ style, ...props }: HeadingProps) {
  return (
    <Text
      style={[styles.h4, style]}
      {...props}
    />
  );
}
