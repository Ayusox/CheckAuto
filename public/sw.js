// Service Worker for CheckAuto PWA
const CACHE_NAME = 'checkauto-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.svg',
  './manifest.json'
];

// Install Event: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network First strategy for data, Cache First for assets
// Since we rely on Firebase (Network), we primarily use this to serve the App Shell
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like Firebase APIs) from SW caching to avoid CORS issues
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found (Cache First for static assets)
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request).catch(() => {
        // Fallback logic could go here (e.g., offline page)
        // For now, we just return nothing or let it fail naturally if offline
      });
    })
  );
});