/**
 * Tabs Component - Tab navigation
 *
 * Horizontal tab bar for switching between different views.
 */

import { Pressable, Text, View, ViewProps, StyleSheet } from 'react-native';

export interface TabsProps extends Omit<ViewProps, 'style'> {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#B97A3D', // Bronze-500
  },
  tab: {
    marginRight: 16,
    paddingBottom: 8,
  },
  text: {
    fontSize: 16,
  },
  textActive: {
    color: '#1A0F08', // Almost black for readability
    fontWeight: '700',
  },
  textInactive: {
    color: '#4A3426', // Dark brown
    fontWeight: '500',
  },
});

export function Tabs({ tabs, active, onChange, ...props }: TabsProps) {
  return (
    <View style={styles.container} {...props}>
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onChange(tab)}
          style={styles.tab}
        >
          <Text
            style={[
              styles.text,
              active === tab ? styles.textActive : styles.textInactive,
            ]}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
