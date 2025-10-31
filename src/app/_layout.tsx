import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AppErrorBoundary } from '@/components/errors';
import { useServiceWorker } from '@/hooks';
import '../global.css';

const styles = StyleSheet.create({
  updateBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7FD1A8',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  updateText: {
    color: '#1A3A2E',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  updateButton: {
    backgroundColor: '#1A3A2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  updateButtonText: {
    color: '#F9F5EB',
    fontSize: 14,
    fontWeight: '600',
  },
});

function UpdateBanner() {
  const { updateAvailable, applyUpdate } = useServiceWorker();

  if (!updateAvailable) {
    return null;
  }

  return (
    <View style={styles.updateBanner}>
      <Text style={styles.updateText}>
        A new version is available!
      </Text>
      <Pressable style={styles.updateButton} onPress={applyUpdate}>
        <Text style={styles.updateButtonText}>Update</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
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
        </Stack>
        <UpdateBanner />
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
