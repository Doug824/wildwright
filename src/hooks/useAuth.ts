/**
 * useAuth Hook
 *
 * Provides authentication state and actions.
 */

import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  signUp as signUpService,
  signIn as signInService,
  signOut as signOutService,
  resetPassword as resetPasswordService,
  sendSignInLink as sendSignInLinkService,
  completeSignInWithEmailLink as completeSignInWithEmailLinkService,
} from '@/services';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

interface UseAuthReturn extends AuthState {
  // Actions
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendSignInLink: (email: string) => Promise<void>;
  completeSignInWithEmailLink: (emailLink: string, email?: string) => Promise<void>;
  clearError: () => void;

  // State
  isAuthenticated: boolean;
  uid: string | null;
}

/**
 * Hook for managing authentication state and actions
 */
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState((prev) => ({
          ...prev,
          user,
          loading: false,
          error: null,
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          user: null,
          loading: false,
          error: error as Error,
        }));
      }
    );

    return unsubscribe;
  }, []);

  // Sign up with email and password
  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        await signUpService(email, password, displayName);
        // User state will be updated by onAuthStateChanged
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
        throw error;
      }
    },
    []
  );

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await signInService(email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await signOutService();
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      await resetPasswordService(email);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  // Send sign-in link (magic link)
  const sendSignInLink = useCallback(async (email: string) => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      await sendSignInLinkService(email);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  // Complete sign-in with email link
  const completeSignInWithEmailLink = useCallback(
    async (emailLink: string, email?: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        await completeSignInWithEmailLinkService(emailLink, email);
        // User state will be updated by onAuthStateChanged
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
        throw error;
      }
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendSignInLink,
    completeSignInWithEmailLink,
    clearError,
    isAuthenticated: !!state.user,
    uid: state.user?.uid || null,
  };
};
