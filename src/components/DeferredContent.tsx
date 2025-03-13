'use client';

import { useState, useEffect, ReactNode } from 'react';

interface DeferredContentProps {
  children: ReactNode;
  delay?: number;
  placeholder?: ReactNode;
  priority?: 'low' | 'medium' | 'high';
  id?: string;
}

/**
 * DeferredContent component delays rendering of non-critical content
 * until after the main page content has loaded
 */
export default function DeferredContent({
  children,
  delay = 0,
  placeholder = null,
  priority = 'medium',
  id,
}: DeferredContentProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Track when this component starts loading
    const trackingId = id || `deferred-content-${Math.random().toString(36).substring(2, 9)}`;
    if (window.trackPerformance) {
      window.trackPerformance.startMark(`load-${trackingId}`);
    }
    
    // Set different delays based on priority
    const priorityDelay = {
      high: 100,
      medium: 300,
      low: 1000,
    }[priority];
    
    // Calculate total delay (base delay + priority-based delay)
    const totalDelay = delay + priorityDelay;
    
    // Use requestIdleCallback if available, otherwise setTimeout
    let timeoutId: number;
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      timeoutId = window.requestIdleCallback(
        () => {
          setShouldRender(true);
          // Add a small delay before showing to allow for smooth transitions
          setTimeout(() => setIsVisible(true), 50);
        },
        { timeout: totalDelay }
      );
    } else {
      timeoutId = setTimeout(() => {
        setShouldRender(true);
        setTimeout(() => setIsVisible(true), 50);
      }, totalDelay) as unknown as number;
    }
    
    return () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.cancelIdleCallback(timeoutId);
      } else {
        clearTimeout(timeoutId as unknown as NodeJS.Timeout);
      }
      
      // End tracking when component unmounts
      if (window.trackPerformance) {
        window.trackPerformance.endMark(`load-${trackingId}`);
      }
    };
  }, [delay, priority, id]);
  
  if (!shouldRender) {
    return <>{placeholder}</>;
  }
  
  return (
    <div 
      className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!isVisible}
    >
      {children}
    </div>
  );
}

// Add TypeScript definitions for requestIdleCallback
declare global {
  interface Window {
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback: (handle: number) => void;
  }
} 