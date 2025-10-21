/**
 * RuneProgress Component - Circular runic progress indicator
 *
 * Displays daily uses with a mystical cyan glow effect.
 * Shows "X/Y" for finite uses or "X/∞" for infinite uses.
 */

import { View, Text, ViewProps } from 'react-native';

export interface RuneProgressProps extends ViewProps {
  used: number;
  total: number | '∞';
  label?: string;
  className?: string;
}

export function RuneProgress({ used, total, label = 'Daily Uses', className = '', ...props }: RuneProgressProps) {
  return (
    <View className={`items-center ${className}`} {...props}>
      <View
        className="w-16 h-16 rounded-full border-2 border-mist-500 justify-center items-center"
        style={{
          shadowColor: '#7FC9C0',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.45,
          shadowRadius: 24,
          elevation: 8,
        }}
      >
        <Text className="text-mist-300 font-ui text-sm font-semibold">
          {typeof total === 'number' ? `${used}/${total}` : `${used}/∞`}
        </Text>
      </View>
      {label && (
        <Text className="text-parchment-200 text-xs mt-1 font-ui">{label}</Text>
      )}
    </View>
  );
}
