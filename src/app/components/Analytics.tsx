'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface PerformanceEntryWithDelay extends PerformanceEntry {
  processingStart?: number;
  hadRecentInput?: boolean;
  value?: number;
}

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + searchParams.toString();
    
    // Page view tracking
    performance.mark('pageview-start');
    
    // Report performance metrics
    const reportWebVitals = ({ name, value }: { name: string, value: number }) => {
      const metrics = {
        name,
        value,
        path: url,
        timestamp: Date.now(),
      };

      // You can send this to your analytics service
      // console.log('Performance Metrics:', metrics);
    };

    // Measure Core Web Vitals
    if (window.performance) {
      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        reportWebVitals({ name: 'FCP', value: fcp.startTime });
      }

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        reportWebVitals({ name: 'LCP', value: lastEntry.startTime });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          const fidEntry = entry as PerformanceEntryWithDelay;
          if (fidEntry.processingStart) {
            reportWebVitals({ name: 'FID', value: fidEntry.processingStart - entry.startTime });
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach(entry => {
          const clsEntry = entry as PerformanceEntryWithDelay;
          if (!clsEntry.hadRecentInput && clsEntry.value) {
            clsValue += clsEntry.value;
          }
        });
        reportWebVitals({ name: 'CLS', value: clsValue });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    return () => {
      performance.clearMarks();
    };
  }, [pathname, searchParams]);

  return null;
} 