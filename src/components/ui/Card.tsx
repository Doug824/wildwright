/**
 * Card Component - Parchment card with bronze border
 *
 * The foundation of the WildWright UI - a beautiful parchment-style card
 * with bronze borders and subtle shadows.
 */

import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className = '', style, ...props }: CardProps) {
  return (
    <View
      className={`bg-parchment-100 border border-bronze-500 rounded-xl2 p-4 ${className}`}
      style={[{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 18, elevation: 6 }, style]}
      {...props}
    />
  );
}
