/**
 * Navigation utilities for handling Next.js navigation
 */

/**
 * Safely patches the window.history.replaceState method to work with Next.js
 * This ensures that navigation state is properly maintained
 */
export function patchHistoryReplaceState() {
  if (typeof window !== 'undefined') {
    const originalReplaceState = window.history.replaceState;
    
    window.history.replaceState = function(state, title, url) {
      // Handle Next.js specific state objects
      if ((state && state.__NA) || (state && state._N)) {
        state = Object.assign({}, state);
        url && normalizeUrl(url);
      }
      
      return originalReplaceState.call(this, state, title, url);
    };
  }
}

/**
 * Normalizes a URL for consistent handling
 */
function normalizeUrl(url: string | URL | null): string | URL | null {
  // Add any URL normalization logic here if needed
  return url;
}

/**
 * Initialize navigation patches when the app starts
 */
export function initNavigationPatches() {
  patchHistoryReplaceState();
} 