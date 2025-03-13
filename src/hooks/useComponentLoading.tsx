'use client';

import { useState, useEffect } from 'react';

/**
 * Hook for managing component-level loading states
 * @param initialState - Initial loading state
 * @param options - Options for controlling loading behavior
 * @returns Loading state and functions to control it
 */
export function useComponentLoading(
  initialState = false,
  options = { showGlobal: false, minDuration: 500 }
) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Record when loading started
      setStartTime(Date.now());
    } else if (startTime !== null) {
      // Calculate how long we've been loading
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, options.minDuration - elapsedTime);
      
      // If we haven't loaded for the minimum duration, wait before stopping
      if (remainingTime > 0) {
        const timer = setTimeout(() => {
          setStartTime(null);
        }, remainingTime);
        
        return () => clearTimeout(timer);
      } else {
        // We've loaded for at least the minimum duration, stop immediately
        setStartTime(null);
      }
    }
  }, [isLoading, startTime, options.minDuration]);

  const startComponentLoading = () => setIsLoading(true);
  const stopComponentLoading = () => setIsLoading(false);

  return {
    isLoading,
    startLoading: startComponentLoading,
    stopLoading: stopComponentLoading
  };
} 