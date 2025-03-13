'use client';

import { useEffect } from 'react';
import { initFontOptimization } from '@/utils/fontOptimizer';
import { monitorMemoryUsage } from '@/utils/memoryMonitor';
import { initServiceWorker } from '@/utils/serviceWorkerRegistration';

interface PerformanceOptimizerProps {
  criticalFonts?: string[];
  enableServiceWorker?: boolean;
  enableMemoryMonitoring?: boolean;
  memoryCheckInterval?: number;
  onOnline?: () => void;
  onOffline?: () => void;
}

// Define extended PerformanceEntry types
interface PerformanceEntryWithProcessingStart extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

/**
 * PerformanceOptimizer initializes all performance optimizations
 * This component should be included near the top of your app
 */
export default function PerformanceOptimizer({
  criticalFonts,
  enableServiceWorker = true,
  enableMemoryMonitoring = true,
  memoryCheckInterval = 30000, // 30 seconds
  onOnline,
  onOffline,
}: PerformanceOptimizerProps) {
  useEffect(() => {
    // Initialize font optimization
    initFontOptimization(criticalFonts);
    
    // Initialize service worker if enabled
    let cleanupServiceWorker = () => {};
    if (enableServiceWorker) {
      cleanupServiceWorker = initServiceWorker(onOnline, onOffline);
    }
    
    // Initialize memory monitoring if enabled
    let cleanupMemoryMonitoring = () => {};
    if (enableMemoryMonitoring) {
      cleanupMemoryMonitoring = monitorMemoryUsage(memoryCheckInterval);
    }
    
    // Track initial page load performance
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      
      // Wait for the page to fully load
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigationStart = timing.navigationStart;
          const loadTime = timing.loadEventEnd - navigationStart;
          const domContentLoaded = timing.domContentLoadedEventEnd - navigationStart;
          const firstPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint');
          const firstContentfulPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');
          
          console.info('[PERFORMANCE] Page load metrics:', {
            totalLoadTime: `${loadTime}ms`,
            domContentLoaded: `${domContentLoaded}ms`,
            firstPaint: firstPaint ? `${firstPaint.startTime.toFixed(2)}ms` : 'N/A',
            firstContentfulPaint: firstContentfulPaint ? `${firstContentfulPaint.startTime.toFixed(2)}ms` : 'N/A',
            ttfb: `${timing.responseStart - timing.requestStart}ms`,
          });
          
          // Check for Core Web Vitals if available
          if ('PerformanceObserver' in window) {
            try {
              // Check for Largest Contentful Paint
              const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                if (entries.length > 0) {
                  const lastEntry = entries[entries.length - 1];
                  console.info(`[PERFORMANCE] Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
                }
                lcpObserver.disconnect();
              });
              
              lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
              
              // Check for First Input Delay / Input Latency
              const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                  const fidEntry = entry as PerformanceEntryWithProcessingStart;
                  console.info(`[PERFORMANCE] First Input Delay: ${fidEntry.processingStart - fidEntry.startTime}ms`);
                });
                fidObserver.disconnect();
              });
              
              fidObserver.observe({ type: 'first-input', buffered: true });
              
              // Check for Cumulative Layout Shift
              const clsObserver = new PerformanceObserver((entryList) => {
                let clsValue = 0;
                const entries = entryList.getEntries();
                
                entries.forEach(entry => {
                  const layoutShiftEntry = entry as LayoutShiftEntry;
                  if (!layoutShiftEntry.hadRecentInput) {
                    clsValue += layoutShiftEntry.value;
                  }
                });
                
                console.info(`[PERFORMANCE] Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
              });
              
              clsObserver.observe({ type: 'layout-shift', buffered: true });
            } catch (e) {
              console.error('[PERFORMANCE] Error setting up Core Web Vitals monitoring:', e);
            }
          }
        }, 0);
      });
    }
    
    return () => {
      // Clean up all observers and listeners
      cleanupServiceWorker();
      cleanupMemoryMonitoring();
    };
  }, [criticalFonts, enableServiceWorker, enableMemoryMonitoring, memoryCheckInterval, onOnline, onOffline]);
  
  // This component doesn't render anything
  return null;
} 