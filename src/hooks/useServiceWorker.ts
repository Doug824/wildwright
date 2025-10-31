/**
 * useServiceWorker Hook
 *
 * Registers service worker and handles update detection.
 * Provides method to refresh when updates are available.
 */

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Only run on web
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        console.log('[App] Service worker registered');
        setRegistration(reg);

        // Check for updates every 60 seconds
        setInterval(() => {
          reg.update();
        }, 60000);

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('[App] Update available');
                setUpdateAvailable(true);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[App] Service worker registration failed:', error);
      });

    // Listen for controller change (update activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[App] Controller changed, reloading...');
      window.location.reload();
    });
  }, []);

  const applyUpdate = () => {
    if (!registration || !registration.waiting) {
      return;
    }

    // Tell the service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  return {
    updateAvailable,
    applyUpdate,
  };
}
