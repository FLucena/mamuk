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
const NAVIGATION_THROTTLE = 500;

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastNavigationTime, setLastNavigationTime] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingNavigationRef = useRef<string | null>(null);

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
        
        // Check if there's a pending navigation
        if (pendingNavigationRef.current && pendingNavigationRef.current !== pathname) {
          const pendingPath = pendingNavigationRef.current;
          pendingNavigationRef.current = null;
          // Execute the pending navigation after a short delay
          setTimeout(() => {
            navigateTo(pendingPath);
          }, 100);
        }
      }, 300);
    }
  }, [pathname, isNavigating]);

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