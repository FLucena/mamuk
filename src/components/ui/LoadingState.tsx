'use client';

import { useEffect, useState } from 'react';

interface LoadingStateProps {
  /**
   * Whether to show the loading state
   */
  isLoading: boolean;
  
  /**
   * Whether to show the loading state as a full-screen overlay
   */
  fullScreen?: boolean;
  
  /**
   * The size of the loading logo
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * The minimum time to show the loading state in milliseconds
   */
  minDuration?: number;
  
  /**
   * The children to render when not loading
   */
  children: React.ReactNode;
}

export default function LoadingState({
  isLoading,
  fullScreen = false,
  size = 'md',
  minDuration = 500,
  children
}: LoadingStateProps) {
  const [shouldShow, setShouldShow] = useState(isLoading);
  
  useEffect(() => {
    if (isLoading) {
      setShouldShow(true);
      
      // If loading completes too quickly, still show the loading state for minDuration
      // to avoid flickering
      if (!isLoading && minDuration > 0) {
        const timer = setTimeout(() => {
          setShouldShow(false);
        }, minDuration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setShouldShow(false);
    }
  }, [isLoading, minDuration]);
  
  // Determine size class based on prop
  const sizeClass = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];
  
  if (shouldShow) {
    if (fullScreen) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
          <div className="flex flex-col items-center">
            <div className={`animate-spin rounded-full ${sizeClass} border-2 border-t-transparent border-blue-600 dark:border-blue-400`}></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Loading...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center p-4">
        <div className={`animate-spin rounded-full ${sizeClass} border-2 border-t-transparent border-blue-600 dark:border-blue-400`}></div>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Export a simple spinner component for direct use
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];
  
  return (
    <div className={`animate-spin rounded-full ${sizeClass} border-2 border-t-transparent border-blue-600 dark:border-blue-400`}></div>
  );
} 