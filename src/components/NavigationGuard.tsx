'use client';

import { useEffect, useRef, ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationGuardProps {
  children: ReactNode;
}

/**
 * NavigationGuard component to prevent excessive redirects
 * This component monitors navigation patterns and can prevent navigation loops
 */
export default function NavigationGuard({ children }: NavigationGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navigationCountRef = useRef<Record<string, { count: number; timestamp: number }>>({});
  const lastPathRef = useRef<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  
  // Track navigation history for the session
  const navigationHistoryRef = useRef<Array<{ path: string; timestamp: number }>>([]);
  
  // Constants for loop detection
  const LOOP_THRESHOLD = 3; // Number of rapid navigations to consider a loop
  const TIME_WINDOW = 3000; // Time window in ms to consider for loop detection
  const BLOCK_DURATION = 2000; // How long to block navigation when a loop is detected

  useEffect(() => {
    if (!pathname) return;

    const now = Date.now();
    
    // Add to navigation history
    navigationHistoryRef.current.push({ path: pathname, timestamp: now });
    
    // Keep history at a reasonable size
    if (navigationHistoryRef.current.length > 20) {
      navigationHistoryRef.current.shift();
    }
    
    // If we're currently blocking navigation, don't process further
    if (isBlocking) {
      return;
    }
    
    // Initialize or update the navigation count for this path
    if (!navigationCountRef.current[pathname]) {
      navigationCountRef.current[pathname] = { count: 1, timestamp: now };
    } else {
      const timeDiff = now - navigationCountRef.current[pathname].timestamp;
      
      // If the navigation to the same path happens within 2 seconds, increment the count
      if (timeDiff < 2000) {
        navigationCountRef.current[pathname].count += 1;
        
        // If we detect too many rapid navigations to the same path, block navigation temporarily
        if (navigationCountRef.current[pathname].count > LOOP_THRESHOLD) {
          console.warn('Rapid navigation to the same path detected, blocking navigation temporarily');
          setIsBlocking(true);
          
          // Unblock after a delay
          setTimeout(() => {
            setIsBlocking(false);
          }, BLOCK_DURATION);
        }
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
        
        if (timeDiff < TIME_WINDOW) {
          navigationCountRef.current[key].count += 1;
          navigationCountRef.current[key].timestamp = now;
          
          // If we detect a potential navigation loop, block navigation temporarily
          if (navigationCountRef.current[key].count > LOOP_THRESHOLD) {
            console.warn('Navigation loop detected between:', lastPathRef.current, 'and', pathname);
            
            // Block navigation temporarily
            setIsBlocking(true);
            
            // Unblock after a delay
            setTimeout(() => {
              setIsBlocking(false);
            }, BLOCK_DURATION);
            
            // Optionally, you could force navigation to a safe path to break the loop
            // if (typeof window !== 'undefined') {
            //   window.history.pushState(null, '', pathname);
            // }
          }
        } else {
          // Reset if it's been more than the time window
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
  }, [pathname, isBlocking]);

  // Render a blocking overlay if we're blocking navigation
  if (isBlocking) {
    return (
      <>
        {children}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none'
          }}
        >
          {/* This div is invisible but blocks navigation */}
        </div>
      </>
    );
  }

  return <>{children}</>;
} 