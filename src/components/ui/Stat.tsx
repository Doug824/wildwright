/**
 * Stat Component - Display a labeled stat value
 *
 * Shows a stat label, primary value, and optional subtitle.
 * Used for HP, AC, Saves, Speed, etc.
 */

import { View, Text, ViewProps } from 'react-native';

export interface StatProps extends ViewProps {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}

export function Stat({ label, value, sub, className = '', ...props }: StatProps) {
  return (
    <View className={`mr-4 mb-3 ${className}`} {...props}>
      <Text className="text-parchment-300 text-xs font-ui uppercase tracking-wide">
        {label}
      </Text>
      <Text className="text-parchment-50 text-2xl font-display font-semibold">
        {value}
      </Text>
      {sub && (
        <Text className="text-parchment-300 text-xs font-ui mt-0.5">
          {sub}
        </Text>
      )}
    </View>
  );
}
