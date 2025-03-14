// Service Worker for caching and offline support
const CACHE_NAME = 'mamuk-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/logo512.png',
];

const CACHE_STRATEGIES = {
  staticAssets: {
    type: 'cache-first',
    paths: [
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)$/,
    ],
  },
  pages: {
    type: 'network-first',
    paths: [
      /^\/(?!api\/)/,
    ],
  },
  api: {
    type: 'network-only',
    paths: [
      /^\/api\//,
    ],
  },
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      self.clients.claim(),
    ])
  );
});

// Helper function to determine if a request is for an API
const isApiRequest = (url) => {
  return url.pathname.startsWith('/api/');
};

// Helper function to determine if a request is for an image
const isImageRequest = (url) => {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];
  return imageExtensions.some(ext => url.pathname.endsWith(ext));
};

// Helper function to determine if a request is for a static asset
const isStaticAsset = (url) => {
  const staticExtensions = ['.css', '.js', '.json', '.woff', '.woff2', '.ttf', '.otf'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) || 
         url.pathname.startsWith('/_next/static/');
};

async function handleFetch(event) {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (!url.origin.includes(self.location.origin)) {
    return fetch(request);
  }

  // Find matching cache strategy
  const strategy = Object.values(CACHE_STRATEGIES).find(({ paths }) =>
    paths.some((path) => path.test(url.pathname))
  );

  if (!strategy) {
    return fetch(request);
  }

  switch (strategy.type) {
    case 'cache-first':
      return caches.match(request).then((response) =>
        response || fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
      );

    case 'network-first':
      try {
        const response = await fetch(request);
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return response;
      } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || caches.match(OFFLINE_URL);
      }

    case 'network-only':
    default:
      try {
        return await fetch(request);
      } catch (error) {
        return caches.match(OFFLINE_URL);
      }
  }
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event));
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/logo.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
    },
  };

  event.waitUntil(
    self.registration.showNotification('Mamuk Training', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
}); 