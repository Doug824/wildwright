/**
 * Heading Components - Epic Druidic Typography
 *
 * Magical forest-inspired headings with ethereal glows.
 */

import { Text, TextProps, StyleSheet } from 'react-native';

export interface HeadingProps extends TextProps {}

const styles = StyleSheet.create({
  h1: {
    color: '#2C1810', // Deep forest brown for readability
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    // Magical druidic green glow
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  h2: {
    color: '#2C1810', // Deep forest brown
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: 1.5,
    textAlign: 'center',
    // Magical druidic green glow
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  h3: {
    color: '#3D2817', // Rich brown
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: 1,
    // Subtle magical glow
    textShadowColor: '#6B9F7F',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  h4: {
    color: '#4A3426', // Warm brown
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

/**
 * H1 - Large display heading with powerful magical glow
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
 * H2 - Section heading with magical glow
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
 * H3 - Subsection heading with subtle glow
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
