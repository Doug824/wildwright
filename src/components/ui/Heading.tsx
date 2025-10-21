/**
 * Heading Components - Display typography for the WildWright UI
 *
 * Beautiful serif headings using Crimson Pro font family.
 */

import { Text, TextProps } from 'react-native';

export interface HeadingProps extends TextProps {
  className?: string;
}

/**
 * H1 - Large display heading
 */
export function H1({ className = '', ...props }: HeadingProps) {
  return (
    <Text
      className={`font-display text-forest-50 text-3xl font-bold ${className}`}
      {...props}
    />
  );
}

/**
 * H2 - Section heading
 */
export function H2({ className = '', ...props }: HeadingProps) {
  return (
    <Text
      className={`font-display text-forest-50 text-2xl font-semibold ${className}`}
      {...props}
    />
  );
}

/**
 * H3 - Subsection heading
 */
export function H3({ className = '', ...props }: HeadingProps) {
  return (
    <Text
      className={`font-display text-forest-50 text-xl font-medium ${className}`}
      {...props}
    />
  );
}

/**
 * H4 - Small heading
 */
export function H4({ className = '', ...props }: HeadingProps) {
  return (
    <Text
      className={`font-display text-forest-50 text-lg ${className}`}
      {...props}
    />
  );
}
