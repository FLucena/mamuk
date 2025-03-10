'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isNavigationLoop, clearNavigationHistory } from '@/lib/navigationUtils';

interface NavigationContextType {
  isNavigating: boolean;
  navigateTo: (path: string) => void;
  lastNavigationTime: number;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Minimum time between navigations in milliseconds
const NAVIGATION_THROTTLE = 1000;
// Maximum number of pending navigations to process
const MAX_NAVIGATION_DEPTH = 2;

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastNavigationTime, setLastNavigationTime] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingNavigationRef = useRef<string | null>(null);
  const navigationDepthRef = useRef<number>(0);

  // Clear any pending navigation timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Reset navigation state when pathname changes
  useEffect(() => {
    if (isNavigating) {
      // Add a small delay to ensure the animation is visible
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        
        // Reset navigation depth when navigation completes
        navigationDepthRef.current = 0;
        
        // Check if there's a pending navigation
        if (pendingNavigationRef.current && pendingNavigationRef.current !== pathname) {
          // Only process pending navigation if we haven't exceeded the maximum depth
          if (navigationDepthRef.current < MAX_NAVIGATION_DEPTH) {
            const pendingPath = pendingNavigationRef.current;
            pendingNavigationRef.current = null;
            
            // Increment navigation depth
            navigationDepthRef.current += 1;
            
            // Execute the pending navigation after a short delay
            setTimeout(() => {
              // Direct router push instead of navigateTo to avoid potential loops
              router.push(pendingPath);
            }, 100);
          } else {
            // Log warning and clear pending navigation if max depth exceeded
            console.warn('Maximum navigation depth exceeded, cancelling pending navigation');
            pendingNavigationRef.current = null;
          }
        }
      }, 300);
    }
  }, [pathname, isNavigating, router]);

  const navigateTo = (path: string) => {
    // Don't trigger navigation if already on the path
    if (pathname === path) return;
    
    // Check if this navigation might be part of a loop
    if (isNavigationLoop(path)) {
      console.warn('Navigation loop detected, preventing redirect to:', path);
      return;
    }
    
    const now = Date.now();
    const timeSinceLastNav = now - lastNavigationTime;
    
    // If we're currently navigating, store this as a pending navigation
    if (isNavigating) {
      pendingNavigationRef.current = path;
      return;
    }
    
    // If we've navigated too recently, queue this navigation
    if (timeSinceLastNav < NAVIGATION_THROTTLE) {
      // Clear any existing timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      // Queue the navigation after the throttle period
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(true);
        setLastNavigationTime(Date.now());
        router.push(path);
      }, NAVIGATION_THROTTLE - timeSinceLastNav);
      
      return;
    }
    
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
    
    setIsNavigating(true);
    setLastNavigationTime(now);
    
    // Navigate to the path
    router.push(path);
  };

  return (
    <NavigationContext.Provider value={{ isNavigating, navigateTo, lastNavigationTime }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
} 