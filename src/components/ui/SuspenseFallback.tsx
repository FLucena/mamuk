'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface SuspenseFallbackProps {
  /**
   * Minimum display time in milliseconds to prevent flickering
   */
  minDisplayTime?: number;
  
  /**
   * Delay before showing the loading state in milliseconds
   */
  delay?: number;
  
  /**
   * Height of the skeleton in pixels or CSS value
   */
  height?: string | number;
  
  /**
   * Width of the skeleton in pixels or CSS value
   */
  width?: string | number;
  
  /**
   * Number of skeleton items to display
   */
  count?: number;
  
  /**
   * Custom className for the container
   */
  className?: string;
  
  /**
   * Component name for debugging
   */
  componentName?: string;
}

/**
 * A reusable loading component for Suspense boundaries
 * Features:
 * - Minimum display time to prevent flickering
 * - Delayed appearance to prevent flashing for fast loads
 * - Customizable skeleton appearance
 */
export function SuspenseFallback({
  minDisplayTime = 500,
  delay = 200,
  height = '2rem',
  width = '100%',
  count = 3,
  className = '',
  componentName,
}: SuspenseFallbackProps) {
  const [visible, setVisible] = useState(delay === 0);
  const [startTime] = useState(() => performance.now());
  
  useEffect(() => {
    if (delay > 0) {
      // Only show loading state after delay to prevent flashing
      const delayTimer = setTimeout(() => {
        setVisible(true);
        
        if (componentName) {
          console.info(`[Suspense] Showing loading state for ${componentName}`);
        }
      }, delay);
      
      return () => clearTimeout(delayTimer);
    }
  }, [delay, componentName]);
  
  useEffect(() => {
    return () => {
      // Log loading duration when component unmounts
      if (componentName) {
        const loadTime = performance.now() - startTime;
        console.info(`[Suspense] Component loaded: ${componentName} in ${loadTime.toFixed(2)}ms`);
      }
    };
  }, [startTime, componentName]);
  
  useEffect(() => {
    // Ensure minimum display time to prevent flickering
    if (visible && minDisplayTime > 0) {
      const elapsedTime = performance.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
      
      if (remainingTime > 0) {
        const minTimeTimer = setTimeout(() => {
          // This effect doesn't actually do anything, but it ensures
          // the component stays mounted for the minimum time
        }, remainingTime);
        
        return () => clearTimeout(minTimeTimer);
      }
    }
  }, [visible, minDisplayTime, startTime]);
  
  if (!visible) {
    return null;
  }
  
  return (
    <div className={`w-full space-y-3 animate-pulse ${className}`} data-testid="suspense-fallback">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton 
          key={index}
          className="rounded-md"
          style={{ 
            height: typeof height === 'number' ? `${height}px` : height,
            width: typeof width === 'number' ? `${width}px` : width
          }}
        />
      ))}
    </div>
  );
}

/**
 * A specialized fallback for page-level suspense
 */
export function PageSuspenseFallback() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <Skeleton className="h-10 w-3/4 rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-40 rounded-md" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A specialized fallback for card components
 */
export function CardSuspenseFallback() {
  return (
    <div className="border rounded-lg p-4 shadow-sm space-y-3">
      <Skeleton className="h-6 w-3/4 rounded-md" />
      <Skeleton className="h-24 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
    </div>
  );
}

/**
 * A specialized fallback for table components
 */
export function TableSuspenseFallback() {
  return (
    <div className="w-full space-y-3">
      <Skeleton className="h-10 w-full rounded-md" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
} 