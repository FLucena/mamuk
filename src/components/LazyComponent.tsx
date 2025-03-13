'use client';

import { Suspense, lazy, ComponentType, ReactNode, useState, useEffect } from 'react';

interface LazyComponentProps {
  importFn: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode;
  errorFallback?: ReactNode | ((error: Error) => ReactNode);
  props?: Record<string, any>;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  id?: string;
}

/**
 * LazyComponent handles dynamic imports with proper loading states and error handling
 * It also tracks performance metrics for component loading
 */
export default function LazyComponent({
  importFn,
  fallback = <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-800 rounded-md"></div>,
  errorFallback = <div className="text-red-500 p-4 border border-red-300 rounded-md">Failed to load component</div>,
  props = {},
  onLoad,
  onError,
  id,
}: LazyComponentProps) {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loadStartTime] = useState<number>(performance.now());
  const componentId = id || `lazy-component-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    // Start tracking component load time
    if (window.trackPerformance) {
      window.trackPerformance.startMark(`load-${componentId}`);
    }

    let isMounted = true;

    const loadComponent = async () => {
      try {
        const module = await importFn();
        
        if (isMounted) {
          setComponent(() => module.default);
          
          const loadTime = performance.now() - loadStartTime;
          console.info(`[PERFORMANCE] Lazy component loaded: ${componentId} - ${loadTime.toFixed(2)}ms`);
          
          if (window.trackPerformance) {
            window.trackPerformance.endMark(`load-${componentId}`);
          }
          
          if (onLoad) onLoad();
        }
      } catch (err) {
        if (isMounted) {
          console.error(`[ERROR] Failed to load lazy component: ${componentId}`, err);
          setError(err as Error);
          if (onError) onError(err as Error);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [importFn, componentId, loadStartTime, onLoad, onError]);

  if (error) {
    return typeof errorFallback === 'function' 
      ? errorFallback(error) as JSX.Element
      : errorFallback as JSX.Element;
  }

  if (!Component) {
    return fallback as JSX.Element;
  }

  return <Component {...props} />;
}

/**
 * Helper function to create a lazy-loaded component with proper typing
 */
export function createLazyComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: Omit<LazyComponentProps, 'importFn' | 'props'> = {}
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <LazyComponent
        importFn={importFn}
        props={props}
        {...options}
      />
    );
  };
} 