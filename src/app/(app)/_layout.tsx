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
          backgroundColor: '#2A4A3A', // forest-600
          borderTopColor: '#7FD1A8', // magical green glow
          borderTopWidth: 3,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          shadowColor: '#7FD1A8',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 16,
        },
        tabBarActiveTintColor: '#7FD1A8', // Magical green
        tabBarInactiveTintColor: '#F9F5EB', // Bright parchment - highly visible
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.5,
          textShadowColor: '#000',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          backgroundColor: 'transparent', // Remove background for better text visibility
          marginHorizontal: 2,
          borderRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="forms"
        options={{
          title: 'Forms',
          tabBarLabel: 'Forms',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarLabel: 'Library',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="character"
        options={{
          title: 'Character',
          tabBarLabel: 'Character',
          tabBarIcon: () => null,
        }}
      />
      {/* Settings removed - can be added back if needed via menu or button */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hidden from tabs - access via settings button if needed
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
