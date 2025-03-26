import { lazy, ComponentType } from 'react';

/**
 * Utility functions for lazy loading assets
 */

/**
 * Creates an image element with lazy loading
 * @param src Image source URL
 * @param alt Alternative text for the image
 * @param className Optional CSS classes
 * @returns HTMLImageElement with lazy loading enabled
 */
export const createLazyImage = (
  src: string,
  alt: string,
  className?: string
): HTMLImageElement => {
  const img = new Image();
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  if (className) {
    img.className = className;
  }
  return img;
};

/**
 * Dynamic import for components
 * Use this for components that are only needed in certain scenarios
 * @param importFn Function that returns the import promise
 * @returns The lazy-loaded component
 */
export const lazyImport = <T extends ComponentType<unknown>, I extends { [K2 in K]: T }, K extends keyof I>(
  importFn: () => Promise<I>,
  key: K
) => {
  const LazyComponent = lazy(async () => {
    const module = await importFn();
    return { default: module[key] };
  });

  return LazyComponent;
}; 