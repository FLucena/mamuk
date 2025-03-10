/**
 * Navigation utility functions to prevent excessive redirects and navigation loops
 */

// Store navigation history to detect loops
const navigationHistory: { path: string; timestamp: number }[] = [];
const MAX_HISTORY_SIZE = 10;
const LOOP_DETECTION_THRESHOLD = 3; // Number of identical navigations to consider a loop
const LOOP_TIME_WINDOW = 5000; // Time window in ms to consider for loop detection

/**
 * Check if a navigation might be part of a loop
 * @param path The path being navigated to
 * @returns True if this navigation appears to be part of a loop
 */
export function isNavigationLoop(path: string): boolean {
  const now = Date.now();
  
  // Add current navigation to history
  navigationHistory.push({ path, timestamp: now });
  
  // Keep history at a reasonable size
  if (navigationHistory.length > MAX_HISTORY_SIZE) {
    navigationHistory.shift();
  }
  
  // Only check for loops if we have enough history
  if (navigationHistory.length < LOOP_DETECTION_THRESHOLD) {
    return false;
  }
  
  // Count recent navigations to this path
  const recentNavigations = navigationHistory.filter(
    item => item.path === path && now - item.timestamp < LOOP_TIME_WINDOW
  );
  
  return recentNavigations.length >= LOOP_DETECTION_THRESHOLD;
}

/**
 * Clear navigation history
 */
export function clearNavigationHistory(): void {
  navigationHistory.length = 0;
}

/**
 * Get the current navigation history
 */
export function getNavigationHistory(): { path: string; timestamp: number }[] {
  return [...navigationHistory];
} 