'use client';

import { useEffect, useState, memo } from 'react';
import { trackRender } from '@/lib/utils/debug';

interface RenderTrackerProps {
  componentName: string;
  showCount?: boolean;
}

// Memoize the RenderTracker component to prevent unnecessary re-renders
export default memo(function RenderTracker({ componentName, showCount = false }: RenderTrackerProps) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const renderCount = trackRender(componentName);
    setCount(renderCount);
  }, [componentName]);
  
  // Only show in development and if showCount is true
  if (process.env.NODE_ENV !== 'development' || !showCount) {
    return null;
  }
  
  return (
    <div className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
      {componentName}: {count} renders
    </div>
  );
}); 