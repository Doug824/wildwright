/**
 * TanStack Query Configuration
 *
 * Configures query client with AsyncStorage persistence for offline support.
 */

import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create persister for offline caching
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

// Create query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      gcTime: 1000 * 60 * 5,

      // Consider data stale after 1 minute
      staleTime: 1000 * 60,

      // Retry failed queries 3 times with exponential backoff
      retry: 3,

      // Refetch on window focus
      refetchOnWindowFocus: true,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry failed mutations 2 times
      retry: 2,
    },
  },
});
