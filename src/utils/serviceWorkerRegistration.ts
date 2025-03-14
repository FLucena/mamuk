/**
 * Service Worker registration utility
 * Helps with registering and managing the service worker for offline support and caching
 */

// Check if service workers are supported
const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

// Check if we're in a secure context (needed for service workers)
const isSecureContext = () => {
  return window.isSecureContext;
};

// Check if we're in development mode
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Register the service worker
 */
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Skip registration in development to avoid common issues
  if (isDevelopment()) {
    console.info('[ServiceWorker] Skipping registration in development mode');
    return Promise.resolve(null);
  }
  
  if (!isServiceWorkerSupported()) {
    console.info('[ServiceWorker] Service workers are not supported in this browser');
    return Promise.resolve(null);
  }
  
  if (!isSecureContext()) {
    console.info('[ServiceWorker] Service workers require a secure context (HTTPS or localhost)');
    return Promise.resolve(null);
  }
  
  // Start tracking performance
  if (window.trackPerformance) {
    window.trackPerformance.startMark('sw-registration');
  }
  
  const startTime = performance.now();
  
  // Verificar primero si el service worker está disponible
  return fetch('/sw.js', { method: 'HEAD' })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Service worker file not available: ${response.status} ${response.statusText}`);
      }
      
      // Verificar el tipo MIME
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('javascript')) {
        console.warn(`[ServiceWorker] Unexpected MIME type: ${contentType}. Expected application/javascript.`);
      }
      
      // Proceder con el registro
      return navigator.serviceWorker.register('/sw.js', { 
        scope: '/',
        type: 'classic' // Explicitly set the type
      });
    })
    .then((registration) => {
      const registrationTime = performance.now() - startTime;
      console.info(`[ServiceWorker] Registered successfully in ${registrationTime.toFixed(2)}ms`);
      
      if (window.trackPerformance) {
        window.trackPerformance.endMark('sw-registration');
      }
      
      // Handle updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available, show notification to user
              console.info('[ServiceWorker] New content is available, please refresh');
              
              // You could dispatch an event or call a function to show a notification
              const event = new CustomEvent('serviceWorkerUpdated');
              window.dispatchEvent(event);
            } else {
              // Content is cached for offline use
              console.info('[ServiceWorker] Content is cached for offline use');
            }
          }
        };
      };
      
      return registration;
    })
    .catch((error) => {
      // Handle specific errors
      if (error.name === 'SecurityError') {
        console.warn('[ServiceWorker] Registration failed due to security restrictions. This is normal in some environments.');
      } else if (error.name === 'TypeError' && error.message.includes('MIME type')) {
        console.warn('[ServiceWorker] Registration failed due to MIME type issues. This is common in development.');
      } else {
        console.error('[ServiceWorker] Registration failed:', error);
      }
      
      // End performance tracking
      if (window.trackPerformance) {
        window.trackPerformance.endMark('sw-registration');
      }
      
      // Don't throw the error, just return null
      return null;
    });
}

/**
 * Unregister all service workers
 */
export function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return Promise.resolve(false);
  }
  
  return navigator.serviceWorker.getRegistrations()
    .then((registrations) => {
      const unregisterPromises = registrations.map(registration => registration.unregister());
      return Promise.all(unregisterPromises);
    })
    .then((results) => {
      const allUnregistered = results.every(result => result === true);
      if (allUnregistered) {
        console.info('[ServiceWorker] All service workers unregistered successfully');
      } else {
        console.warn('[ServiceWorker] Some service workers could not be unregistered');
      }
      return allUnregistered;
    })
    .catch((error) => {
      console.error('[ServiceWorker] Unregistration failed:', error);
      return false;
    });
}

/**
 * Check if the app is running in offline mode
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function setupOnlineStatusListeners(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const handleOnline = () => {
    console.info('[Network] App is online');
    if (onOnline) onOnline();
  };
  
  const handleOffline = () => {
    console.warn('[Network] App is offline');
    if (onOffline) onOffline();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Initialize service worker and online status listeners
 */
export function initServiceWorker(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  // Register service worker - no need for explicit catch as we handle errors in the function
  registerServiceWorker().then(registration => {
    if (registration) {
      console.info('[ServiceWorker] Service worker initialized successfully');
    } else {
      console.info('[ServiceWorker] Service worker not initialized (this is normal in some environments)');
    }
  });
  
  // Set up online status listeners
  return setupOnlineStatusListeners(onOnline, onOffline);
} 