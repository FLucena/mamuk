import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Enhanced lazy loading utility that provides better error handling and loading states
 * @param importFn - The import function for the component
 * @param fallback - Optional fallback component name for debugging
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: string
): LazyExoticComponent<T> {
  const LazyComponent = lazy(() => {
    console.info(`[LazyLoad] Loading component${fallback ? `: ${fallback}` : ''}`);
    const startTime = performance.now();
    
    return importFn()
      .then(module => {
        const loadTime = performance.now() - startTime;
        console.info(`[LazyLoad] Component loaded${fallback ? ` (${fallback})` : ''} in ${loadTime.toFixed(2)}ms`);
        return module;
      })
      .catch(error => {
        console.error(`[LazyLoad] Failed to load component${fallback ? ` (${fallback})` : ''}:`, error);
        throw error;
      });
  });
  
  // Add display name for debugging
  if (fallback) {
    // Using type assertion to set displayName
    (LazyComponent as any).displayName = `Lazy(${fallback})`;
  }
  
  return LazyComponent;
}

/**
 * Creates a lazy-loaded component with a specific loading delay for testing
 * Only use this in development to simulate slow network conditions
 */
export function lazyLoadWithDelay<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  delayMs: number = 1000,
  fallback?: string
): LazyExoticComponent<T> {
  if (process.env.NODE_ENV !== 'development') {
    return lazyLoad(importFn, fallback);
  }
  
  return lazy(() => {
    console.info(`[LazyLoad] Loading component with ${delayMs}ms delay${fallback ? `: ${fallback}` : ''}`);
    const startTime = performance.now();
    
    return new Promise<{ default: T }>(resolve => {
      setTimeout(() => {
        importFn()
          .then(module => {
            const loadTime = performance.now() - startTime;
            console.info(`[LazyLoad] Component loaded${fallback ? ` (${fallback})` : ''} in ${loadTime.toFixed(2)}ms (including delay)`);
            resolve(module);
          })
          .catch(error => {
            console.error(`[LazyLoad] Failed to load component${fallback ? ` (${fallback})` : ''}:`, error);
            throw error;
          });
      }, delayMs);
    });
  });
} 