/**
 * Auth Layout
 *
 * Layout for authentication screens (sign-in, sign-up, forgot-password).
 * All screens in this folder will use this layout.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1f3527' }, // forest-700
      }}
    />
  );
}
