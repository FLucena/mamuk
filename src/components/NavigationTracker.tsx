'use client';

import { useEffect, useRef, memo, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackNavigation, logNavigationStats } from '@/lib/utils/debug';

// Debounce function to limit the frequency of function calls
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Custom equality function for memo - always return true since this component has no props
function areEqual() {
  return true;
}

// Memoize the component to prevent unnecessary re-renders
const NavigationTracker = memo(function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef<string | null>(null);
  const navigationCountRef = useRef<number>(0);
  
  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true);
  // Store the current full URL (path + search params) to detect actual navigation
  const currentUrlRef = useRef<string>('');
  // Track navigation throttling
  const lastNavigationTimeRef = useRef<number>(0);
  // Aumentar el tiempo de throttling para reducir la frecuencia de navegaciones
  const navigationThrottleTimeRef = useRef<number>(1000); // Aumentado a 1000ms (1 segundo)
  
  // Aumentar el tiempo de debounce para reducir la frecuencia de llamadas
  const debouncedTrackNavigation = useCallback(
    debounce((from: string, to: string) => {
      trackNavigation(from, to);
    }, 500), // Aumentado a 500ms
    []
  );
  
  // Aumentar el tiempo de debounce para reducir la frecuencia de llamadas
  const debouncedLogStats = useCallback(
    debounce(() => {
      logNavigationStats();
    }, 1000), // Aumentado a 1000ms
    []
  );
  
  // Optimize by combining the pathname and searchParams effects
  useEffect(() => {
    // Skip work in development mode for faster hot reloading
    if (process.env.NODE_ENV === 'development' && 
        window.location.hostname === 'localhost' && 
        navigationCountRef.current < 3) {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        prevPathRef.current = pathname;
      }
      return;
    }
    
    // Create the full URL - do this calculation only once per effect
    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Skip tracking on first render to avoid counting initial page load as navigation
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      // Initialize navigation count from sessionStorage if available
      const storedCount = sessionStorage.getItem('navigation-count');
      if (storedCount) {
        navigationCountRef.current = parseInt(storedCount, 10);
      }
      
      // Set initial URL and path
      currentUrlRef.current = fullUrl;
      prevPathRef.current = pathname;
      
      return;
    }
    
    // Check if this is an actual navigation (URL changed)
    const isActualNavigation = fullUrl !== currentUrlRef.current;
    
    // Early return if no actual navigation occurred
    if (!isActualNavigation) return;
    
    // Check for navigation throttling
    const now = Date.now();
    const timeSinceLastNavigation = now - lastNavigationTimeRef.current;
    
    // Only log and process if there's an actual navigation and not throttled
    if (timeSinceLastNavigation > navigationThrottleTimeRef.current) {
      // Update last navigation time
      lastNavigationTimeRef.current = now;
      
      // Track navigation between pages - use debounced version
      if (prevPathRef.current && prevPathRef.current !== pathname) {
        debouncedTrackNavigation(prevPathRef.current, pathname || '');
      }
      
      // Update previous path
      prevPathRef.current = pathname;
      
      // Count renders in this session (only increment on actual navigation)
      navigationCountRef.current += 1;
      
      // Limit the frequency of sessionStorage updates - use modulo 20 instead of 10
      if (navigationCountRef.current % 20 === 0) { // Reducir frecuencia de actualizaciones
        sessionStorage.setItem('navigation-count', navigationCountRef.current.toString());
      }
        
      if (navigationCountRef.current > 50) { // Aumentar el umbral de 30 a 50
        // Use debounced version to avoid excessive logging
        debouncedLogStats();
      }
      
      // Log stats on every 30th navigation (reducir frecuencia from 20 to 30)
      if (navigationCountRef.current % 30 === 0 && navigationCountRef.current > 0) {
        debouncedLogStats();
      }
    }
    
    // Always update current URL reference to prevent further throttling
    currentUrlRef.current = fullUrl;
  }, [pathname, searchParams, debouncedTrackNavigation, debouncedLogStats]);

  // This component doesn't render anything
  return null;
}, areEqual);

export default NavigationTracker; 