/**
 * Navigation utility functions to prevent excessive redirects and navigation loops
 */

// Store navigation history to detect loops
const navigationHistory: { path: string; timestamp: number }[] = [];
const MAX_HISTORY_SIZE = 20; // Increased from 10 to catch more complex patterns
const LOOP_DETECTION_THRESHOLD = 3; // Number of identical navigations to consider a loop
const LOOP_TIME_WINDOW = 5000; // Time window in ms to consider for loop detection

// Track path pairs to detect back-and-forth navigation
const pathPairHistory: Record<string, { count: number; lastTimestamp: number }> = {};
const PATH_PAIR_THRESHOLD = 3; // Number of back-and-forth navigations to consider a loop
const PATH_PAIR_TIME_WINDOW = 10000; // Time window for path pair detection

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
  
  // Get the previous path if available
  const prevPath = navigationHistory.length >= 2 
    ? navigationHistory[navigationHistory.length - 2].path 
    : null;
  
  // Check for back-and-forth navigation pattern (A -> B -> A -> B)
  if (prevPath && prevPath !== path) {
    const pathPair = [prevPath, path].sort().join('-');
    
    if (!pathPairHistory[pathPair]) {
      pathPairHistory[pathPair] = { count: 1, lastTimestamp: now };
    } else {
      const timeDiff = now - pathPairHistory[pathPair].lastTimestamp;
      
      if (timeDiff < PATH_PAIR_TIME_WINDOW) {
        pathPairHistory[pathPair].count += 1;
        pathPairHistory[pathPair].lastTimestamp = now;
        
        // If we detect a back-and-forth pattern exceeding our threshold
        if (pathPairHistory[pathPair].count >= PATH_PAIR_THRESHOLD) {
          console.warn('Back-and-forth navigation loop detected between:', prevPath, 'and', path);
          return true;
        }
      } else {
        // Reset if it's been too long
        pathPairHistory[pathPair] = { count: 1, lastTimestamp: now };
      }
    }
  }
  
  // Only check for loops if we have enough history
  if (navigationHistory.length < LOOP_DETECTION_THRESHOLD) {
    return false;
  }
  
  // Count recent navigations to this path
  const recentNavigations = navigationHistory.filter(
    item => item.path === path && now - item.timestamp < LOOP_TIME_WINDOW
  );
  
  // Clean up old entries in pathPairHistory
  Object.keys(pathPairHistory).forEach(key => {
    if (now - pathPairHistory[key].lastTimestamp > PATH_PAIR_TIME_WINDOW) {
      delete pathPairHistory[key];
    }
  });
  
  return recentNavigations.length >= LOOP_DETECTION_THRESHOLD;
}

/**
 * Clear navigation history
 */
export function clearNavigationHistory(): void {
  navigationHistory.length = 0;
  Object.keys(pathPairHistory).forEach(key => {
    delete pathPairHistory[key];
  });
}

/**
 * Get the current navigation history
 */
export function getNavigationHistory(): { path: string; timestamp: number }[] {
  return [...navigationHistory];
} 