/**
 * Tabs Layout
 *
 * Bottom tab navigation for the main app screens.
 */

import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A3A2E', // forest-700 darker
          borderTopColor: '#B97A3D', // bronze-500
          borderTopWidth: 2,
          height: 60,
        },
        tabBarActiveTintColor: '#7FC9C0', // cyan glow
        tabBarInactiveTintColor: '#D4C5A9', // parchment-300
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="character"
        options={{
          title: 'Characters',
          tabBarLabel: 'Characters',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
