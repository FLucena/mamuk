'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface SpinnerContextType {
  isLoading: boolean;
  showSpinner: () => void;
  hideSpinner: () => void;
  withSpinner: <T>(promise: Promise<T>) => Promise<T>;
}

const SpinnerContext = createContext<SpinnerContextType | undefined>(undefined);

export function SpinnerProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading state on navigation
  useEffect(() => {
    setIsLoading(false);
    setLoadingCount(0);
  }, [pathname, searchParams]);

  // Show spinner
  const showSpinner = useCallback(() => {
    setLoadingCount(prev => prev + 1);
    setIsLoading(true);
  }, []);

  // Hide spinner
  const hideSpinner = useCallback(() => {
    setLoadingCount(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setIsLoading(false);
      }
      return newCount;
    });
  }, []);

  // Utility to wrap promises with spinner
  const withSpinner = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    showSpinner();
    try {
      const result = await promise;
      return result;
    } finally {
      hideSpinner();
    }
  }, [showSpinner, hideSpinner]);

  // Expose spinner controller to window for global access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.spinnerController = {
        show: showSpinner,
        hide: hideSpinner,
        isVisible: () => isLoading
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.spinnerController;
      }
    };
  }, [showSpinner, hideSpinner, isLoading]);

  return (
    <SpinnerContext.Provider value={{ isLoading, showSpinner, hideSpinner, withSpinner }}>
      {children}
    </SpinnerContext.Provider>
  );
}

export function useSpinner() {
  const context = useContext(SpinnerContext);
  if (context === undefined) {
    throw new Error('useSpinner must be used within a SpinnerProvider');
  }
  return context;
}

// Add type definition for the global spinner controller
declare global {
  interface Window {
    spinnerController?: {
      show: () => void;
      hide: () => void;
      isVisible: () => boolean;
    };
  }
} 