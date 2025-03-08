'use client';

import React, { createContext, useContext } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

// Create a dummy context with no-op functions
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {}
});

export function useLoading() {
  return useContext(LoadingContext);
}

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  // This is now just a pass-through component that doesn't do anything
  return <>{children}</>;
} 