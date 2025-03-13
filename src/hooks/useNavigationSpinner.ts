'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSpinner } from '@/contexts/SpinnerContext';

/**
 * Hook to automatically show a spinner during page navigation
 * @param options Configuration options
 */
export function useNavigationSpinner(options: {
  delay?: number; // Delay before showing spinner (ms)
  minDuration?: number; // Minimum duration to show spinner (ms)
} = {}) {
  const { delay = 300, minDuration = 500 } = options;
  const { showSpinner, hideSpinner } = useSpinner();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let showTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;
    let startTime: number;

    // Function to handle navigation start
    const handleNavigationStart = () => {
      // Clear any existing timeouts
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);

      // Set a timeout to show the spinner after the delay
      showTimeout = setTimeout(() => {
        showSpinner();
        startTime = Date.now();
      }, delay);
    };

    // Function to handle navigation end
    const handleNavigationEnd = () => {
      // Clear the show timeout if navigation completed before delay
      clearTimeout(showTimeout);

      // If spinner is showing, ensure it shows for at least minDuration
      if (startTime) {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minDuration - elapsedTime);

        hideTimeout = setTimeout(() => {
          hideSpinner();
          startTime = 0;
        }, remainingTime);
      }
    };

    // Register event listeners for navigation
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleNavigationStart);
      window.addEventListener('unload', handleNavigationEnd);
      
      // For Next.js client-side navigation
      const handleRouteChangeStart = () => handleNavigationStart();
      const handleRouteChangeComplete = () => handleNavigationEnd();
      
      // Try to access Next.js router events if available
      if (window.next && window.next.router && window.next.router.events) {
        window.next.router.events.on('routeChangeStart', handleRouteChangeStart);
        window.next.router.events.on('routeChangeComplete', handleRouteChangeComplete);
        window.next.router.events.on('routeChangeError', handleRouteChangeComplete);
      }

      return () => {
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);
        window.removeEventListener('beforeunload', handleNavigationStart);
        window.removeEventListener('unload', handleNavigationEnd);
        
        if (window.next && window.next.router && window.next.router.events) {
          window.next.router.events.off('routeChangeStart', handleRouteChangeStart);
          window.next.router.events.off('routeChangeComplete', handleRouteChangeComplete);
          window.next.router.events.off('routeChangeError', handleRouteChangeComplete);
        }
      };
    }
  }, [delay, minDuration, showSpinner, hideSpinner]);

  // Also handle navigation via pathname and searchParams changes
  useEffect(() => {
    hideSpinner();
  }, [pathname, searchParams, hideSpinner]);
}

// Add type definition for Next.js router events
declare global {
  interface Window {
    next?: {
      router?: {
        events: {
          on: (event: string, callback: () => void) => void;
          off: (event: string, callback: () => void) => void;
        };
      };
    };
  }
} 