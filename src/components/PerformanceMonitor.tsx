'use client';

import { useEffect, useRef, memo } from 'react';

// Custom equality function for memo - always return true since this component has no props
function areEqual() {
  return true;
}

// Interface for performance marks
interface PerformanceMark {
  name: string;
  startTime: number;
}

// Memoize the component to prevent unnecessary re-renders
const PerformanceMonitor = memo(function PerformanceMonitor() {
  // Use refs to track initialization and store the observer
  const isInitializedRef = useRef<boolean>(false);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const renderTimeRef = useRef<number>(performance.now());
  const marksRef = useRef<Map<string, PerformanceMark>>(new Map());
  
  useEffect(() => {
    // Skip if already initialized to ensure this only runs once
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    // Calculate render time
    const renderTime = performance.now() - renderTimeRef.current;
    console.info(`[PERFORMANCE] Initial render time: ${renderTime.toFixed(2)}ms`);
    
    // Track navigation performance if available
    if (window.performance && window.performance.getEntriesByType) {
      const navigationEntries = window.performance.getEntriesByType('navigation');
      if (navigationEntries && navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
        console.info('[PERFORMANCE] Navigation metrics:', {
          domComplete: navEntry.domComplete.toFixed(2),
          domInteractive: navEntry.domInteractive.toFixed(2),
          loadEventEnd: navEntry.loadEventEnd.toFixed(2),
          responseEnd: navEntry.responseEnd.toFixed(2),
          ttfb: navEntry.responseStart - navEntry.requestStart
        });
      }
    }
    
    // Track long tasks
    if ('PerformanceObserver' in window) {
      try {
        // Create a new observer only if it doesn't exist
        if (!observerRef.current) {
          observerRef.current = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // Get the current stack trace if available
              const stack = new Error().stack || 'Stack trace unavailable';
              
              // Try to identify the source of the long task
              let taskSource = 'Unknown';
              if ('attribution' in entry && Array.isArray((entry as any).attribution)) {
                const attribution = (entry as any).attribution[0];
                if (attribution && attribution.containerType) {
                  taskSource = attribution.containerType;
                  if (attribution.containerName) {
                    taskSource += ` (${attribution.containerName})`;
                  }
                }
              }
              
              console.warn('[PERFORMANCE] Long task detected:', {
                duration: entry.duration.toFixed(2) + 'ms',
                startTime: entry.startTime.toFixed(2) + 'ms',
                source: taskSource,
                culprit: getCurrentExecutingScript(),
                entryType: entry.entryType
              });
              
              // Check if this long task overlaps with any of our custom marks
              checkOverlappingMarks(entry.startTime, entry.startTime + entry.duration);
            }
          });
          
          observerRef.current.observe({ entryTypes: ['longtask'] });
        }
        
        // Set up observer for resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Only log resources that take more than 500ms to load
            if (entry.duration > 500) {
              console.warn('[PERFORMANCE] Slow resource load:', {
                name: entry.name,
                duration: entry.duration.toFixed(2) + 'ms',
                initiatorType: (entry as PerformanceResourceTiming).initiatorType
              });
            }
          }
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
        
      } catch (e) {
        console.error('PerformanceObserver setup failed:', e);
      }
    }
    
    // Expose performance tracking methods globally
    if (typeof window !== 'undefined') {
      (window as any).trackPerformance = {
        startMark: (name: string) => {
          const startTime = performance.now();
          marksRef.current.set(name, { name, startTime });
          console.info(`[PERFORMANCE] Started tracking: ${name}`);
          return startTime;
        },
        endMark: (name: string) => {
          const endTime = performance.now();
          const mark = marksRef.current.get(name);
          if (mark) {
            const duration = endTime - mark.startTime;
            console.info(`[PERFORMANCE] ${name} took ${duration.toFixed(2)}ms`);
            marksRef.current.delete(name);
            return duration;
          }
          console.warn(`[PERFORMANCE] No start mark found for: ${name}`);
          return 0;
        }
      };
    }
    
    return () => {
      // Clean up observer on unmount
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      // Remove global tracking methods
      if (typeof window !== 'undefined') {
        delete (window as any).trackPerformance;
      }
    };
  }, []); // Empty dependency array ensures this only runs once
  
  // Helper function to check if a long task overlaps with any of our custom marks
  const checkOverlappingMarks = (taskStart: number, taskEnd: number) => {
    marksRef.current.forEach((mark, name) => {
      // If the mark's start time is within the long task timeframe
      if (mark.startTime >= taskStart && mark.startTime <= taskEnd) {
        console.warn(`[PERFORMANCE] Long task may be affecting operation: ${name}`);
      }
    });
  };
  
  // Helper function to try to identify the currently executing script
  const getCurrentExecutingScript = (): string => {
    try {
      // This will create an error with a stack trace
      throw new Error();
    } catch (e) {
      const stack = (e as Error).stack || '';
      // Try to extract the file name from the stack trace
      const stackLines = stack.split('\n');
      // Skip the first few lines which are related to this function
      for (let i = 2; i < stackLines.length; i++) {
        const line = stackLines[i];
        // Look for file paths in the stack trace
        const match = line.match(/at\s+.+\s+\((.+)\)/) || line.match(/at\s+(.+):/);
        if (match && match[1]) {
          return match[1].split('/').pop() || 'Unknown';
        }
      }
      return 'Unknown';
    }
  };
  
  // This component doesn't render anything
  return null;
}, areEqual);

export default PerformanceMonitor; 