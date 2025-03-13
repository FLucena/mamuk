'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle } from 'lucide-react';

interface ContentErrorBoundaryProps {
  children: React.ReactNode;
  name?: string; // Optional name to identify which section had an error
}

/**
 * A general-purpose error boundary for content sections
 * Provides a user-friendly fallback UI with a retry option
 */
const ContentErrorBoundary = ({ children, name = 'content' }: ContentErrorBoundaryProps) => {
  const handleError = (error: Error) => {
    // Log to your analytics or error tracking service
    console.error(`${name} error:`, error);
  };

  // Custom fallback UI for content errors
  const fallbackUI = (
    <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">
            We're having trouble loading this section
          </h3>
          <div className="mt-2 text-base text-yellow-700 dark:text-yellow-400">
            <p>
              There was a problem loading the {name}. You can try refreshing the page or come back later.
            </p>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Refresh page
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackUI} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default ContentErrorBoundary; 