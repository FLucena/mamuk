'use client';

import { useCallback } from 'react';
import { useSpinner } from '@/contexts/SpinnerContext';

/**
 * Custom hook for easily using the global spinner in components
 * Provides methods to show/hide the spinner and wrap async operations
 */
export function useLoadingSpinner() {
  const { showSpinner, hideSpinner, withSpinner, isLoading } = useSpinner();

  /**
   * Executes a callback function with the spinner shown
   * @param callback Function to execute while showing the spinner
   * @returns The result of the callback
   */
  const executeWithSpinner = useCallback(
    async <T,>(callback: () => Promise<T>): Promise<T> => {
      return withSpinner(callback());
    },
    [withSpinner]
  );

  /**
   * Wraps a function to show the spinner while it executes
   * @param fn Function to wrap
   * @returns Wrapped function that shows spinner during execution
   */
  const wrapWithSpinner = useCallback(
    <T extends unknown[], R>(fn: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R> => {
        return withSpinner(fn(...args));
      };
    },
    [withSpinner]
  );

  return {
    showSpinner,
    hideSpinner,
    withSpinner,
    executeWithSpinner,
    wrapWithSpinner,
    isLoading
  };
} 