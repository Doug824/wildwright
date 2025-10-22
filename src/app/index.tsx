/**
 * Root Index Screen
 *
 * Handles initial routing based on authentication state.
 * Redirects to sign-in if not authenticated, or tabs if authenticated.
 */

import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '@/hooks';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 bg-forest-700 items-center justify-center">
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
