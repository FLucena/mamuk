// Service Worker for Mamuk App
const CACHE_NAME = 'mamuk-cache-v1';
const OFFLINE_URL = '/offline';

// Cache strategies
const CACHE_STRATEGIES = {
  'cache-first': 'cache-first',
  'network-first': 'network-first',
  'network-only': 'network-only'
};

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/logo.png',
  '/favicon.ico',
];

// Assets to cache
const urlsToCache = [
  ...STATIC_ASSETS
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('Service worker install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
    .catch((error) => {
      console.error('Service worker activation error:', error);
    })
  );
});

// Handle fetch events
function handleFetch(event) {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip browser-extension requests
  if (event.request.url.includes('chrome-extension')) {
    return;
  }

  // Skip all API requests
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Skip Next.js script and data requests
  if (event.request.url.includes('/_next/data/') || 
      event.request.url.includes('/_next/static/') ||
      event.request.url.endsWith('.js') || 
      event.request.url.endsWith('.json')) {
    return;
  }
  
  // Create fetch options with redirect mode set to follow
  const fetchOptions = {
    credentials: 'same-origin',
    redirect: 'follow'
  };

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found (cache-first strategy)
        if (response) {
          return response;
        }

        // Make network request with proper redirect mode
        return fetch(event.request, fetchOptions)
          .then((response) => {
            // Check if valid response - also handle redirects properly
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Error caching response:', error);
              });

            return response;
          })
          .catch((error) => {
            console.error('Fetch error:', error);
            // If the request is for a page, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
}

// Only handle specific fetch events to prevent issues
self.addEventListener('fetch', (event) => {
  // Skip handling service worker and Next.js assets
  if (event.request.url.includes('/sw.js') || 
      event.request.url.includes('/_next/') || 
      event.request.url.endsWith('.js') || 
      event.request.url.endsWith('.json')) {
    return;
  }
  
  // Only handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    handleFetch(event);
    return;
  }
  
  // Handle asset requests for cached resources
  if (STATIC_ASSETS.some(asset => event.request.url.endsWith(asset))) {
    handleFetch(event);
  }
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
      .catch(error => {
        console.error('Notification error:', error);
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
      .catch(error => {
        console.error('Error opening window:', error);
      })
  );
}); 