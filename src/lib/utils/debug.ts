/**
 * Utility functions for debugging and performance monitoring
 */

/**
 * Tracks the number of renders for a component
 * @param componentName The name of the component to track
 * @returns The current render count
 */
export function trackRender(componentName: string): number {
  if (typeof window === 'undefined') return 0;
  
  const key = `render-count-${componentName}`;
  const count = parseInt(sessionStorage.getItem(key) || '0', 10) + 1;
  sessionStorage.setItem(key, count.toString());
  
  if (count > 5) {
    // Removed console.warn
  }
  
  return count;
}

/**
 * Tracks the time between navigation events
 * @param from The source page/component
 * @param to The destination page/component
 */
export function trackNavigation(from: string, to: string): void {
  if (typeof window === 'undefined') return;
  
  const now = performance.now();
  const lastNavTime = parseFloat(sessionStorage.getItem('last-navigation-time') || '0');
  const timeSinceLast = now - lastNavTime;
  
  if (lastNavTime > 0 && timeSinceLast < 300) {
    // Removed console.warn}ms)`);
  }
  
  // Removed console.log
  sessionStorage.setItem('last-navigation-time', now.toString());
  sessionStorage.setItem('last-navigation-from', from);
  sessionStorage.setItem('last-navigation-to', to);
}

/**
 * Gets navigation statistics for the current session
 */
export function getNavigationStats(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  
  const stats: Record<string, any> = {};
  
  // Collect all render counts
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('render-count-')) {
      const componentName = key.replace('render-count-', '');
      stats[componentName] = parseInt(sessionStorage.getItem(key) || '0', 10);
    }
  }
  
  // Add navigation count
  stats.navigationCount = parseInt(sessionStorage.getItem('navigation-count') || '0', 10);
  
  return stats;
}

/**
 * Logs the current navigation statistics to the console
 */
export function logNavigationStats(): void {
  // Removed console.table);
} 