'use client';

import { Suspense, lazy, ComponentType, ReactNode, useState, useEffect } from 'react';

// Define a generic type for component props
type GenericProps = Record<string, unknown>;

interface LazyComponentProps<P = GenericProps> {
  importFn: () => Promise<{ default: ComponentType<P> }>;
  fallback?: ReactNode;
  errorFallback?: ReactNode | ((error: Error) => ReactNode);
  props?: P;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  id?: string;
}

/**
 * LazyComponent handles dynamic imports with proper loading states and error handling
 * It also tracks performance metrics for component loading
 */
export default function LazyComponent<P extends GenericProps = GenericProps>({
  importFn,
  fallback = <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-800 rounded-md"></div>,
  errorFallback = <div className="text-red-500 p-4 border border-red-300 rounded-md">Failed to load component</div>,
  props = {} as P,
  onLoad,
  onError,
  id,
}: LazyComponentProps<P>): JSX.Element {
  type LoadedComponentType = ComponentType<P>;
  
  const [Component, setComponent] = useState<LoadedComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loadStartTime] = useState<number>(performance.now());
  const componentId = id || `lazy-component-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    // Start tracking component load time
    const windowWithTracking = window as unknown as { 
      trackPerformance?: { 
        startMark: (id: string) => void,
        endMark: (id: string) => void 
      } 
    };
    
    if (windowWithTracking.trackPerformance) {
      windowWithTracking.trackPerformance.startMark(`load-${componentId}`);
    }

    let isMounted = true;

    const loadComponent = async (): Promise<void> => {
      try {
        const importedModule = await importFn();
        
        if (isMounted) {
          setComponent(() => importedModule.default);
          
          const loadTime = performance.now() - loadStartTime;
          console.info(`[PERFORMANCE] Lazy component loaded: ${componentId} - ${loadTime.toFixed(2)}ms`);
          
          if (windowWithTracking.trackPerformance) {
            windowWithTracking.trackPerformance.endMark(`load-${componentId}`);
          }
          
          if (onLoad) onLoad();
        }
      } catch (err) {
        if (isMounted) {
          console.error(`[ERROR] Failed to load lazy component: ${componentId}`, err);
          const errorObject = err instanceof Error ? err : new Error(String(err));
          setError(errorObject);
          if (onError) onError(errorObject);
        }
      }
    };

    void loadComponent();

    return () => {
      isMounted = false;
    };
  }, [importFn, componentId, loadStartTime, onLoad, onError]);

  if (error) {
    return typeof errorFallback === 'function' 
      ? (errorFallback(error) as JSX.Element)
      : (errorFallback as JSX.Element);
  }

  if (!Component) {
    return fallback as JSX.Element;
  }

  const ComponentToRender = Component as React.FC<P>;
  return <ComponentToRender {...props} />;
}

/**
 * Helper function to create a lazy-loaded component with proper typing
 */
export function createLazyComponent<T extends GenericProps>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: Omit<LazyComponentProps<T>, 'importFn' | 'props'> = {}
): React.FC<T> {
  const LazyLoadedComponent: React.FC<T> = (props: T) => (
    <LazyComponent<T>
      importFn={importFn}
      props={props}
      {...options}
    />
  );
  
  return LazyLoadedComponent;
} 