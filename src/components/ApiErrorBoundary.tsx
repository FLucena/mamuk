'use client';

import React, { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { reportError } from '@/lib/sentry';

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  apiName: string; // Name of the API for better error context
  maxRetries?: number; // Maximum number of retries
  retryDelay?: number; // Delay between retries in milliseconds
  onRetry?: () => Promise<void>; // Custom retry function
}

/**
 * A specialized error boundary for API requests with retry logic
 */
const ApiErrorBoundary = ({
  children,
  apiName,
  maxRetries = 3,
  retryDelay = 1000,
  onRetry,
}: ApiErrorBoundaryProps) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = (error: Error) => {
    // Report to Sentry with API context
    reportError(error, {
      apiName,
      retryCount,
      isNetworkError: error.message.includes('network') || error.message.includes('fetch'),
    });
    
    // Log to console
    console.error(`API Error (${apiName}):`, error);
  };

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      // Removed console.warn reached for ${apiName}`);
      return;
    }

    setIsRetrying(true);
    
    try {
      if (onRetry) {
        // Use custom retry logic if provided
        await onRetry();
      } else {
        // Default retry logic with exponential backoff
        const backoffDelay = retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
    } catch (error) {
      console.error(`Retry attempt ${retryCount + 1} failed for ${apiName}:`, error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Custom fallback UI for API errors
  const fallbackUI = (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Connection Error
          </h3>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
            <p>
              We couldn't connect to the server. This might be due to a network issue or the server might be temporarily unavailable.
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying || retryCount >= maxRetries}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Retrying...
                </>
              ) : retryCount >= maxRetries ? (
                'Max retries reached'
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry ({retryCount}/{maxRetries})
                </>
              )}
            </button>
            {retryCount > 0 && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                Retry attempts: {retryCount}/{maxRetries}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackUI} onError={handleError} name={`API-${apiName}`}>
      {children}
    </ErrorBoundary>
  );
};

export default ApiErrorBoundary; 