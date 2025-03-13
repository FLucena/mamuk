'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useRef } from 'react';

/**
 * Custom router hook that provides a navigate method with throttling
 * to prevent excessive navigation and browser hanging
 * @returns An enhanced router with a navigate method
 */
export function useViewTransitionRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const lastNavigationTimeRef = useRef<number>(0);
  const navigationThrottleTimeRef = useRef<number>(500); // ms between navigations
  
  const navigate = useCallback(
    (href: string) => {
      // Don't navigate to the current path
      if (href === pathname) {
        return;
      }
      
      // Check for navigation throttling
      const now = Date.now();
      const timeSinceLastNavigation = now - lastNavigationTimeRef.current;
      
      if (timeSinceLastNavigation < navigationThrottleTimeRef.current) {
        console.warn(`Navigation throttled. Attempted to navigate too quickly (${timeSinceLastNavigation}ms)`);
        return;
      }
      
      // Update last navigation time
      lastNavigationTimeRef.current = now;
      
      // Perform the navigation
      router.push(href);
    },
    [router, pathname]
  );
  
  return {
    ...router,
    navigate,
  };
} 