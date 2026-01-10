/**
 * SendForIran Service Worker
 * Provides offline support with network-first, cache fallback strategy
 */

const CACHE_NAME = 'sendforiran-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/us/',
  '/uk/',
  '/de/',
  '/fr/',
  '/ca/',
  '/fa/',
  '/fa/us/',
  '/fa/uk/',
  '/fa/de/',
  '/fa/fr/',
  '/fa/ca/',
  '/de/',
  '/de/us/',
  '/de/uk/',
  '/de/de/',
  '/de/fr/',
  '/de/ca/',
  '/fr/',
  '/fr/us/',
  '/fr/uk/',
  '/fr/de/',
  '/fr/fr/',
  '/fr/ca/',
  '/favicon.svg',
  '/fonts/inter-regular.woff2',
  '/fonts/inter-medium.woff2',
  '/fonts/inter-semibold.woff2',
  '/fonts/inter-bold.woff2',
  '/fonts/vazirmatn-regular.woff2',
  '/fonts/vazirmatn-medium.woff2',
  '/fonts/vazirmatn-semibold.woff2',
  '/fonts/vazirmatn-bold.woff2',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response before caching
        const responseClone = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // For navigation requests, return cached index
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          
          // Return offline fallback for other requests
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

