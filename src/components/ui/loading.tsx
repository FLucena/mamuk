'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  className?: string;
  size?: number;
}

export function Loading({ className = '', size = 24 }: LoadingProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`animate-spin ${className}`} style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full border-2 border-t-transparent border-gray-500 dark:border-gray-400" />
      </div>
    );
  }

  return (
    <div className={`animate-spin ${className}`} style={{ width: size, height: size }}>
      <Loader2 size={size} className="text-gray-500 dark:text-gray-400" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loading size={32} />
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
} 