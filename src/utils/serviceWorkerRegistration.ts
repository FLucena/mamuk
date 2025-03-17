/**
 * REMOVED: Service Worker functionality has been removed
 * This file is kept as a stub to prevent import errors
 */

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
 * Removed: This function no longer registers a service worker
 * It now only sets up online status listeners
 */
export function initServiceWorker(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  // Service worker functionality has been removed
  console.info('[ServiceWorker] Service worker functionality has been removed');
  
  // Set up online status listeners only
  return setupOnlineStatusListeners(onOnline, onOffline);
}

/**
 * Unused function kept for compatibility
 */
export function registerServiceWorker(): Promise<null> {
  console.info('[ServiceWorker] Service worker functionality has been removed');
  return Promise.resolve(null);
}

/**
 * Unused function kept for compatibility
 */
export function unregisterServiceWorker(): Promise<boolean> {
  console.info('[ServiceWorker] Service worker functionality has been removed');
  return Promise.resolve(true);
} 