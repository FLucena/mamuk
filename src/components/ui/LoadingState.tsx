'use client';

import { useEffect, useState } from 'react';
import LoadingLogo from './LoadingLogo';

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
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      // When loading starts, show immediately
      setShouldShow(true);
    } else if (shouldShow) {
      // When loading ends, wait for minDuration before hiding
      timer = setTimeout(() => {
        setShouldShow(false);
      }, minDuration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, minDuration, shouldShow]);
  
  if (shouldShow) {
    return <LoadingLogo fullScreen={fullScreen} size={size} />;
  }
  
  return <>{children}</>;
}

// Export the LoadingLogo component as well for direct use
export { LoadingLogo }; 