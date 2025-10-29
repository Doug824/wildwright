/**
 * App Shell Layout
 *
 * Bottom tab navigation for the main app screens.
 * Shown after a character has been selected.
 */

import { Tabs } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import { CharacterProvider } from '@/contexts';

export default function AppShellLayout() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 400; // Phone-sized screen

  return (
    <CharacterProvider>
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
          fontSize: isNarrow ? 18 : (Platform.OS === 'web' ? 13 : 11), // Larger emoji on narrow screens
          fontWeight: '700',
          letterSpacing: 0,
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
          margin: 0,
          padding: 0,
          textAlign: 'center',
          lineHeight: isNarrow ? 24 : undefined, // Better emoji vertical alignment
        },
        tabBarItemStyle: {
          paddingVertical: isNarrow ? 10 : (Platform.OS === 'web' ? 10 : 8),
          paddingHorizontal: isNarrow ? 8 : (Platform.OS === 'web' ? 8 : 6),
          backgroundColor: 'rgba(74, 52, 38, 0.9)', // Dark brown bark - solid background
          marginHorizontal: Platform.OS === 'web' ? 3 : 2,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: 'rgba(139, 115, 85, 0.7)',
          shadowColor: '#7FD1A8',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 48, // Larger touch target
          height: 48, // Fixed height for consistency
        },
        tabBarButtonStyle: {
          flex: 1, // Make button fill entire tab area
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
          tabBarLabel: isNarrow ? '🏠' : '🏠 Home',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="forms"
        options={{
          title: 'Forms',
          tabBarLabel: isNarrow ? '📋' : '📋 Forms',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarLabel: isNarrow ? '📚' : '📚 Library',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="character"
        options={{
          title: 'Character',
          tabBarLabel: isNarrow ? '⚔️' : '⚔️ Char',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: isNarrow ? '⚙️' : '⚙️ Set',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="playsheet"
        options={{
          href: null, // Hidden from tabs - accessed via navigation
        }}
      />
      <Tabs.Screen
        name="create-form"
        options={{
          href: null, // Hidden from tabs - accessed via navigation
        }}
      />
      </Tabs>
    </CharacterProvider>
  );
}
