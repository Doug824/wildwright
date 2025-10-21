/**
 * Chip Component - Small tag/badge for tags and abilities
 *
 * Used for displaying tags like "Beast Shape I", "Flanking", "Aquatic", etc.
 */

import { Text, View, ViewProps } from 'react-native';

export interface ChipProps extends ViewProps {
  label: string;
  variant?: 'default' | 'mist';
  className?: string;
}

export function Chip({ label, variant = 'default', className = '', ...props }: ChipProps) {
  const variantClasses = variant === 'mist'
    ? 'bg-mist-500/20 border-mist-500 text-mist-300'
    : 'bg-forest-600 border-bronze-500 text-parchment-100';

  return (
    <View
      className={`px-2 py-1 rounded-full border mr-2 mb-2 ${variantClasses} ${className}`}
      {...props}
    >
      <Text className={`font-ui text-xs ${variant === 'mist' ? 'text-mist-300' : 'text-parchment-100'}`}>
        {label}
      </Text>
    </View>
  );
}
