'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import each performance component
const NavigationTracker = dynamic(() => import('@/components/NavigationTracker'), {
  ssr: false,
});

const NavigationPatcher = dynamic(() => import('@/components/NavigationPatcher'), {
  ssr: false,
});

const PerformanceMonitor = dynamic(() => import('@/components/PerformanceMonitor'), {
  ssr: false,
});

const PerformanceOptimizerWrapper = dynamic(() => import('@/components/PerformanceOptimizerWrapper'), {
  ssr: false,
});

interface PerformanceComponentsProps {
  criticalFonts?: Array<{
    path: string;
    as: string;
    type: string;
    crossOrigin?: string;
  }>;
}

// Combined component that renders all performance components
export default function PerformanceComponents({ criticalFonts = [] }: PerformanceComponentsProps): ReactNode {
  return (
    <>
      <NavigationTracker />
      <NavigationPatcher />
      <PerformanceMonitor />
      <PerformanceOptimizerWrapper 
        criticalFonts={criticalFonts}
        enableMemoryMonitoring={true}
      />
    </>
  );
} 