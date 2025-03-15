'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface PerformanceEntryWithDelay extends PerformanceEntry {
  processingStart?: number;
  hadRecentInput?: boolean;
  value?: number;
}

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Use refs to avoid recreating observers on each render
  const lcpObserverRef = useRef<PerformanceObserver | null>(null);
  const fidObserverRef = useRef<PerformanceObserver | null>(null);
  const clsObserverRef = useRef<PerformanceObserver | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Skip analytics in development mode for better performance during development
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    // Apply sampling in production to reduce performance overhead
    // Only collect metrics for 10% of page views
    if (!isInitializedRef.current && Math.random() > 0.1) {
      isInitializedRef.current = true;
      return;
    }
    
    const url = pathname + (searchParams?.toString() || '');
    
    // Page view tracking - use a more efficient approach
    const pageViewStart = performance.now();
    
    // Report performance metrics - use a more efficient approach with batching
    const metricsQueue: Array<{name: string, value: number}> = [];
    const reportWebVitals = ({ name, value }: { name: string, value: number }) => {
      metricsQueue.push({
        name,
        value,
      });
      
      // Batch send metrics instead of individual sends
      if (metricsQueue.length >= 3 || name === 'CLS') {
        const batchedMetrics = {
          metrics: metricsQueue.slice(),
          path: url,
          timestamp: Date.now(),
        };
        
        // Use sendBeacon for non-blocking analytics when available
        if (navigator && 'sendBeacon' in navigator) {
          try {
            // In a real implementation, you would send to your analytics endpoint
            // navigator.sendBeacon('/api/analytics', JSON.stringify(batchedMetrics));
            
            // For now, just log in a non-blocking way
            setTimeout(() => {
              // console.log('Performance Metrics:', batchedMetrics);
            }, 0);
          } catch (e) {
            // Fallback if sendBeacon fails
            // console.error('Failed to send metrics:', e);
          }
        }
        
        // Clear the queue after sending
        metricsQueue.length = 0;
      }
    };

    // Measure Core Web Vitals - only initialize observers once
    if (window.performance && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      // First Contentful Paint - use a more efficient approach
      const reportFCP = () => {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          reportWebVitals({ name: 'FCP', value: fcp.startTime });
        }
      };
      
      // Use requestIdleCallback to avoid blocking the main thread
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => reportFCP());
      } else {
        setTimeout(reportFCP, 1000);
      }

      // Largest Contentful Paint - reuse observer
      if (!lcpObserverRef.current) {
        lcpObserverRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          reportWebVitals({ name: 'LCP', value: lastEntry.startTime });
          // Disconnect after getting the final LCP value
          if (document.readyState === 'complete') {
            lcpObserverRef.current?.disconnect();
          }
        });
        lcpObserverRef.current.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // First Input Delay - reuse observer
      if (!fidObserverRef.current) {
        fidObserverRef.current = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            const fidEntry = entry as PerformanceEntryWithDelay;
            if (fidEntry.processingStart) {
              reportWebVitals({ name: 'FID', value: fidEntry.processingStart - entry.startTime });
              // Disconnect after getting FID
              fidObserverRef.current?.disconnect();
            }
          });
        });
        fidObserverRef.current.observe({ entryTypes: ['first-input'], buffered: true });
      }

      // Cumulative Layout Shift - reuse observer and limit updates
      if (!clsObserverRef.current) {
        let clsValue = 0;
        let clsEntries = 0;
        let lastEntryTime = 0;
        
        clsObserverRef.current = new PerformanceObserver((list) => {
          // Throttle CLS calculations
          const now = performance.now();
          if (now - lastEntryTime < 1000 && clsEntries > 0) {
            return; // Skip if less than 1 second since last update
          }
          lastEntryTime = now;
          
          list.getEntries().forEach(entry => {
            const clsEntry = entry as PerformanceEntryWithDelay;
            if (!clsEntry.hadRecentInput && clsEntry.value) {
              clsValue += clsEntry.value;
              clsEntries++;
            }
          });
          
          // Report CLS less frequently
          if (clsEntries % 5 === 0 || document.readyState === 'complete') {
            reportWebVitals({ name: 'CLS', value: clsValue });
          }
          
          // Disconnect after page is fully loaded
          if (document.readyState === 'complete' && performance.now() - pageViewStart > 10000) {
            clsObserverRef.current?.disconnect();
          }
        });
        clsObserverRef.current.observe({ entryTypes: ['layout-shift'] });
      }
    }

    return () => {
      // Clean up only when component unmounts, not on every pathname change
      if (pathname !== url.split('?')[0]) {
        performance.clearMarks();
      }
    };
  }, [pathname, searchParams]);

  return null;
} 