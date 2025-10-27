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
          height: Platform.OS === 'ios' ? 90 : Platform.OS === 'web' ? 60 : 70,
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
          fontSize: Platform.OS === 'web' ? 14 : 11,
          fontWeight: '700',
          letterSpacing: 0.2,
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
          marginTop: 0,
          marginBottom: 0,
          paddingVertical: 2,
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === 'web' ? 10 : 6,
          paddingHorizontal: Platform.OS === 'web' ? 12 : 4,
          backgroundColor: 'rgba(74, 52, 38, 0.9)', // Dark brown bark - solid background
          marginHorizontal: Platform.OS === 'web' ? 4 : 2,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: 'rgba(139, 115, 85, 0.7)',
          shadowColor: '#7FD1A8',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          flex: 1,
          justifyContent: 'center', // Center content vertically
          alignItems: 'center', // Center content horizontally
        },
        tabBarAllowFontScaling: false,
        tabBarIconStyle: {
          display: 'none', // Hide icon space since we're not using icons
        }
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
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: () => null,
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
