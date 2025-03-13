'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertOctagon } from 'lucide-react';

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  formName?: string; // Optional name to identify which form had an error
  onReset?: () => void; // Optional callback to reset form state
}

/**
 * A specialized error boundary for forms
 * Provides a user-friendly fallback UI with form-specific actions
 */
const FormErrorBoundary = ({ 
  children, 
  formName = 'form', 
  onReset 
}: FormErrorBoundaryProps) => {
  const handleError = (error: Error) => {
    // Log to your analytics or error tracking service
    console.error(`${formName} error:`, error);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  // Custom fallback UI for form errors
  const fallbackUI = (
    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertOctagon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-300">
            Form Error
          </h3>
          <div className="mt-2 text-sm text-orange-700 dark:text-orange-400">
            <p>
              We encountered a problem with this {formName}. Please try again or contact support if the issue persists.
            </p>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Reset form
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

export default FormErrorBoundary; 