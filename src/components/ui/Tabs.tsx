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
    borderBottomWidth: 2,
    borderBottomColor: '#7FD1A8', // Magical green for visibility
    paddingBottom: 4,
    marginBottom: 12,
  },
  tab: {
    marginRight: 16,
    paddingBottom: 8,
  },
  text: {
    fontSize: 16,
  },
  textActive: {
    color: '#F9F5EB', // Parchment for visibility on dark background
    fontWeight: '700',
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  textInactive: {
    color: '#D4C5A9', // Lighter parchment for inactive
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
