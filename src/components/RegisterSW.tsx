'use client';

import { useEffect } from 'react';

export function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV !== 'production') {
        // Automatically clean up service workers and caches in development mode to prevent HMR/caching issues
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          let hasActiveSW = registrations.length > 0;
          
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log('Unregistered active development service worker.');
              }
            });
          }

          // Clear all Cache Storage in development
          if (typeof window !== 'undefined' && window.caches) {
            window.caches.keys().then((keys) => {
              Promise.all(keys.map(key => window.caches.delete(key))).then(() => {
                console.log('Cleared all cache storage.');
                if (hasActiveSW) {
                  console.log('Reloading window to complete service worker purge.');
                  window.location.reload();
                }
              });
            });
          }
        });
        return;
      }

      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Service Worker registered successfully with scope: ', reg.scope);
          })
          .catch((err) => {
            console.error('Service Worker registration failed: ', err);
          });
      });
    }
  }, []);

  return null;
}
