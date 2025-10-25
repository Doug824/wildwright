import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f172a' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="character-picker" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(tabs)" options={{ href: null }} />
        <Stack.Screen name="playsheet-mock" options={{ href: null }} />
      </Stack>
    </>
  );
}
