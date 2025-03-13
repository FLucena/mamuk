// Service Worker for caching and offline support
const CACHE_NAME = 'mamuk-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
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
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
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

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Different caching strategies based on request type
  if (event.request.method === 'GET') {
    // For API requests - network first, then cache
    if (isApiRequest(url)) {
      event.respondWith(networkFirstStrategy(event.request));
    }
    // For images - cache first, then network
    else if (isImageRequest(url)) {
      event.respondWith(cacheFirstStrategy(event.request));
    }
    // For static assets - stale-while-revalidate
    else if (isStaticAsset(url)) {
      event.respondWith(staleWhileRevalidateStrategy(event.request));
    }
    // For HTML pages - network first with offline fallback
    else if (event.request.headers.get('accept').includes('text/html')) {
      event.respondWith(networkFirstWithOfflineFallback(event.request));
    }
    // Default - network first
    else {
      event.respondWith(networkFirstStrategy(event.request));
    }
  }
});

// Network first strategy - try network, fall back to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Clone the response before caching it
    const responseToCache = networkResponse.clone();
    
    // Cache the response for future use
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, responseToCache);
    });
    
    return networkResponse;
  } catch (error) {
    // If network fails, try to get from cache
    const cachedResponse = await caches.match(request);
    return cachedResponse || Promise.reject('No network and no cache');
  }
}

// Cache first strategy - try cache, fall back to network
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // If in cache, return it but also update cache in background
    fetch(request).then((networkResponse) => {
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, networkResponse);
      });
    }).catch(() => {
      // Ignore network errors when updating cache
    });
    
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache
  try {
    const networkResponse = await fetch(request);
    
    // Clone the response before caching it
    const responseToCache = networkResponse.clone();
    
    // Cache the response for future use
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, responseToCache);
    });
    
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return error
    return Promise.reject('No cache and no network');
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  // Update cache in background regardless of whether we have a cached response
  const fetchPromise = fetch(request).then((networkResponse) => {
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, networkResponse.clone());
    });
    return networkResponse;
  }).catch((error) => {
    console.error('[ServiceWorker] Fetch failed:', error);
    // If fetch fails and we don't have a cached response, this will propagate the error
    if (!cachedResponse) {
      throw error;
    }
  });
  
  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Network first with offline fallback for HTML pages
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Clone the response before caching it
    const responseToCache = networkResponse.clone();
    
    // Cache the response for future use
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, responseToCache);
    });
    
    return networkResponse;
  } catch (error) {
    // If network fails, try to get from cache
    const cachedResponse = await caches.match(request);
    
    // If in cache, return it
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, return offline page
    return caches.match('/offline.html');
  }
} 