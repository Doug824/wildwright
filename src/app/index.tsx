/**
 * Root Index Screen
 *
 * Handles initial routing based on authentication state.
 * Redirects to sign-in if not authenticated, or tabs if authenticated.
 */

import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '@/hooks';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1A3A2E', // Forest-700
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7FC9C0" />
      </View>
    );
  }

  // Redirect based on auth state
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/sign-in" />;
  }
}
