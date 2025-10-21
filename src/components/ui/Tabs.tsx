/**
 * Tabs Component - Tab navigation
 *
 * Horizontal tab bar for switching between different views.
 */

import { Pressable, Text, View, ViewProps } from 'react-native';

export interface TabsProps extends ViewProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className = '', ...props }: TabsProps) {
  return (
    <View className={`flex-row border-b border-bronze-500 ${className}`} {...props}>
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onChange(tab)}
          className="mr-4 pb-2"
        >
          <Text
            className={`font-ui ${
              active === tab
                ? 'text-parchment-50 font-semibold'
                : 'text-parchment-200'
            }`}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
