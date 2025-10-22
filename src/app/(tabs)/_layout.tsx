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
          backgroundColor: '#1f3527', // forest-700
          borderTopColor: '#B97A3D', // bronze-500
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#7FC9C0', // mist-500
        tabBarInactiveTintColor: '#DCCEB1', // parchment-300
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
        }}
      />
    </Tabs>
  );
}
