/**
 * Character Stack Layout
 *
 * Stack navigation for character screens (list, create, detail).
 * This prevents child routes from showing as tabs.
 */

import { Stack } from 'expo-router';

export default function CharacterLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1A3A2E', // Deep forest
        },
        headerTintColor: '#F9F5EB', // Light parchment for text/icons
        headerTitleStyle: {
          fontWeight: '600',
          color: '#F9F5EB',
        },
        contentStyle: {
          backgroundColor: '#0A1F1A', // forest-900 background
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My Characters',
          headerShown: false, // No back button on list (it's the home)
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Character',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Character Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="forms/create"
        options={{
          title: 'Create Wildshape Form',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
