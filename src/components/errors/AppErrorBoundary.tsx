/**
 * App Error Boundary
 *
 * Wraps the app to catch and handle React component errors.
 * Logs errors and displays ErrorFallback component.
 */

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

const logError = (error: Error, info: { componentStack: string }) => {
  // Log to console in development
  if (__DEV__) {
    console.error('Error Boundary caught an error:', error);
    console.error('Component Stack:', info.componentStack);
  }

  // In production, you could send to error reporting service (Sentry, etc.)
  // Example:
  // Sentry.captureException(error, { extra: info });
};

export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Reset app state if needed
        // Could clear AsyncStorage, reset Redux store, etc.
        console.log('Error boundary reset');
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
