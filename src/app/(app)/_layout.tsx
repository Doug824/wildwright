/**
 * App Shell Layout
 *
 * Bottom tab navigation for the main app screens.
 * Shown after a character has been selected.
 */

import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function AppShellLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A3A2E', // forest-700 darker
          borderTopColor: '#B97A3D', // bronze-500
          borderTopWidth: 2,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#7FD1A8', // Magical green
        tabBarInactiveTintColor: '#D4C5A9', // parchment-300
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="forms"
        options={{
          title: 'Forms',
          tabBarLabel: 'Forms',
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarLabel: 'Library',
        }}
      />
      <Tabs.Screen
        name="character"
        options={{
          title: 'Character',
          tabBarLabel: 'Character',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
      <Tabs.Screen
        name="playsheet"
        options={{
          href: null, // Hidden from tabs - accessed via navigation
        }}
      />
    </Tabs>
  );
}
