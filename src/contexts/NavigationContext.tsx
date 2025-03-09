'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationContextType {
  isNavigating: boolean;
  navigateTo: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      }, 300);
    }
  }, [pathname, isNavigating]);

  const navigateTo = (path: string) => {
    // Don't trigger navigation if already on the path
    if (pathname === path) return;
    
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
    
    setIsNavigating(true);
    
    // Navigate to the path
    router.push(path);
    
    // Set a backup timeout to ensure isNavigating is reset
    // This is needed in case the pathname change effect doesn't trigger
    navigationTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 2000); // Longer timeout as a fallback
  };

  return (
    <NavigationContext.Provider value={{ isNavigating, navigateTo }}>
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