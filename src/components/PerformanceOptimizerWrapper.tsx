'use client';

import PerformanceOptimizer from './PerformanceOptimizer';

interface FontPreloadOptions {
  path: string;
  as: string;
  type: string;
  crossOrigin?: string;
}

interface PerformanceOptimizerWrapperProps {
  criticalFonts?: (string | FontPreloadOptions)[];
  enableMemoryMonitoring?: boolean;
  memoryCheckInterval?: number;
}

/**
 * A wrapper component for PerformanceOptimizer that handles the event callbacks
 * This is needed to avoid passing event handlers from server components to client components
 */
export default function PerformanceOptimizerWrapper({
  criticalFonts,
  enableMemoryMonitoring = true,
  memoryCheckInterval = 30000,
}: PerformanceOptimizerWrapperProps) {
  const handleOnline = () => console.info('[APP] Back online');
  const handleOffline = () => console.warn('[APP] App is offline');

  return (
    <PerformanceOptimizer
      criticalFonts={criticalFonts}
      enableMemoryMonitoring={enableMemoryMonitoring}
      memoryCheckInterval={memoryCheckInterval}
      onOnline={handleOnline}
      onOffline={handleOffline}
    />
  );
} 