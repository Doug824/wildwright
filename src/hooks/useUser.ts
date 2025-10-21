/**
 * useUser Hook
 *
 * Provides user profile data from Firestore.
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { UserProfile } from '@/types/firestore';
import { useAuth } from './useAuth';

interface UseUserReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for accessing user profile from Firestore
 * Automatically syncs with Firestore in real-time
 */
export const useUser = (): UseUserReturn => {
  const { uid } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    // Subscribe to user profile in real-time
    const unsubscribe = onSnapshot(
      doc(db, COLLECTIONS.USERS, uid),
      (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('User profile subscription error:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

  return {
    profile,
    loading,
    error,
  };
};
