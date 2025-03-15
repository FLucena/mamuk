'use client';

import { useState, useEffect } from 'react';
import PageLoading from './PageLoading';

interface LoadingProps {
  className?: string;
  size?: number;
}

// This component is now a wrapper around PageLoading for backward compatibility
export function Loading({ className = '', size = 24 }: LoadingProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Still handle SSR case
  if (!isClient) {
    return (
      <div className={`flex justify-center items-center animate-spin ${className}`} style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full border-2 border-t-transparent border-gray-500 dark:border-gray-400" />
      </div>
    );
  }

  return <PageLoading size={size} className={className} />;
}

// This component is now a wrapper around PageLoading for backward compatibility
export function LoadingPage() {
  return <PageLoading />;
}

// This component is now a wrapper around PageLoading for backward compatibility
export function LoadingOverlay() {
  return <PageLoading size={24} />;
} 