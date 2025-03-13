'use client';

import PerformanceOptimizer from './PerformanceOptimizer';

interface PerformanceOptimizerWrapperProps {
  criticalFonts?: string[];
  enableServiceWorker?: boolean;
  enableMemoryMonitoring?: boolean;
  memoryCheckInterval?: number;
}

/**
 * A wrapper component for PerformanceOptimizer that handles the event callbacks
 * This is needed to avoid passing event handlers from server components to client components
 */
export default function PerformanceOptimizerWrapper({
  criticalFonts,
  enableServiceWorker = true,
  enableMemoryMonitoring = true,
  memoryCheckInterval = 30000,
}: PerformanceOptimizerWrapperProps) {
  const handleOnline = () => console.info('[APP] Back online');
  const handleOffline = () => console.warn('[APP] App is offline');

  return (
    <PerformanceOptimizer
      criticalFonts={criticalFonts}
      enableServiceWorker={enableServiceWorker}
      enableMemoryMonitoring={enableMemoryMonitoring}
      memoryCheckInterval={memoryCheckInterval}
      onOnline={handleOnline}
      onOffline={handleOffline}
    />
  );
} 