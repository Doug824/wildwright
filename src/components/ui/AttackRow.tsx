/**
 * AttackRow Component - Display a natural attack with bonus and damage
 *
 * Shows attack name, attack bonus, damage, and optional special traits.
 */

import { View, Text, ViewProps } from 'react-native';

export interface AttackRowProps extends ViewProps {
  name: string;
  bonus: string;
  damage: string;
  trait?: string;
  className?: string;
}

export function AttackRow({ name, bonus, damage, trait, className = '', ...props }: AttackRowProps) {
  return (
    <View
      className={`flex-row justify-between py-3 border-b border-bronze-500/40 ${className}`}
      {...props}
    >
      <View className="flex-row items-center">
        <Text className="text-parchment-50 font-display text-base mr-3">
          {name}
        </Text>
        <Text className="text-parchment-200 font-ui text-sm">
          {bonus}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-parchment-50 font-display text-base mr-2">
          {damage}
        </Text>
        {trait && (
          <Text className="text-parchment-200 font-ui text-xs">
            {trait}
          </Text>
        )}
      </View>
    </View>
  );
}
