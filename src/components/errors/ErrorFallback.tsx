/**
 * Error Fallback Component
 *
 * Displays a user-friendly error screen when the app crashes.
 * Shows error details in development mode only.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const router = useRouter();
  const isDevelopment = __DEV__;

  const handleGoHome = () => {
    resetErrorBoundary();
    router.replace('/(app)/home');
  };

  const handleTryAgain = () => {
    resetErrorBoundary();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Error Icon */}
          <Text style={styles.icon}>⚠️</Text>

          {/* Error Title */}
          <Text style={styles.title}>Something Went Wrong</Text>

          {/* Error Message */}
          <Text style={styles.message}>
            The app encountered an unexpected error. Don't worry, your data is safe!
          </Text>

          {/* Error Details (Development Only) */}
          {isDevelopment && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Error Details (Dev Mode):</Text>
              <View style={styles.detailsBox}>
                <Text style={styles.detailsText}>{error.message}</Text>
                {error.stack && (
                  <Text style={styles.stackTrace}>{error.stack}</Text>
                )}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleTryAgain}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleGoHome}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Go to Home</Text>
            </Pressable>
          </View>

          {/* Help Text */}
          <Text style={styles.helpText}>
            If this problem persists, please contact support or try restarting the app.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9F5EB', // parchment
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  message: {
    fontSize: 16,
    color: '#D4C5A9', // parchment-300
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9F5EB',
    marginBottom: 8,
  },
  detailsBox: {
    backgroundColor: 'rgba(42, 74, 58, 0.5)', // forest with opacity
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7FD1A8',
    padding: 12,
  },
  detailsText: {
    fontSize: 13,
    color: '#F9F5EB',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 11,
    color: '#D4C5A9',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#7FD1A8', // magical green
    borderWidth: 2,
    borderColor: '#2A4A3A',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7FD1A8',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A0F08', // dark text for primary
  },
  secondaryButtonText: {
    color: '#F9F5EB', // light text for secondary
  },
  helpText: {
    fontSize: 12,
    color: '#8B7355', // muted brown
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
