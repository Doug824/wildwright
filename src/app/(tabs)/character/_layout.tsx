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
        headerShown: false,
        contentStyle: {
          backgroundColor: '#0A1F1A', // forest-900 background
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Characters',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Character',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Character Details',
        }}
      />
    </Stack>
  );
}
