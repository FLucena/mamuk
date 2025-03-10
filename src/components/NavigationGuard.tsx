'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationGuardProps {
  children: ReactNode;
}

/**
 * NavigationGuard component to prevent excessive redirects
 * This component monitors navigation patterns and can prevent navigation loops
 */
export default function NavigationGuard({ children }: NavigationGuardProps) {
  const pathname = usePathname();
  const navigationCountRef = useRef<Record<string, { count: number; timestamp: number }>>({});
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const now = Date.now();
    
    // Initialize or update the navigation count for this path
    if (!navigationCountRef.current[pathname]) {
      navigationCountRef.current[pathname] = { count: 1, timestamp: now };
    } else {
      const timeDiff = now - navigationCountRef.current[pathname].timestamp;
      
      // If the navigation to the same path happens within 2 seconds, increment the count
      if (timeDiff < 2000) {
        navigationCountRef.current[pathname].count += 1;
      } else {
        // Reset the count if it's been more than 2 seconds
        navigationCountRef.current[pathname] = { count: 1, timestamp: now };
      }
    }

    // Check for rapid navigation between two paths (potential loop)
    if (lastPathRef.current && lastPathRef.current !== pathname) {
      const key = `${lastPathRef.current}-${pathname}`;
      
      if (!navigationCountRef.current[key]) {
        navigationCountRef.current[key] = { count: 1, timestamp: now };
      } else {
        const timeDiff = now - navigationCountRef.current[key].timestamp;
        
        if (timeDiff < 3000) {
          navigationCountRef.current[key].count += 1;
          navigationCountRef.current[key].timestamp = now;
          
          // If we detect a potential navigation loop, log it
          if (navigationCountRef.current[key].count > 3) {
            console.warn('Potential navigation loop detected between:', lastPathRef.current, 'and', pathname);
            
            // Here you could implement additional protection like:
            // - Force a delay before allowing more navigation
            // - Show a warning to the user
            // - Reset the application state
          }
        } else {
          // Reset if it's been more than 3 seconds
          navigationCountRef.current[key] = { count: 1, timestamp: now };
        }
      }
    }

    // Clean up old entries to prevent memory leaks
    const oldEntries = Object.keys(navigationCountRef.current).filter(
      key => now - navigationCountRef.current[key].timestamp > 10000
    );
    
    oldEntries.forEach(key => {
      delete navigationCountRef.current[key];
    });

    // Update the last path
    lastPathRef.current = pathname;
  }, [pathname]);

  return <>{children}</>;
} 