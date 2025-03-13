'use client';

import React from 'react';
import { useError, ErrorSeverity, ErrorType, createApiError, createValidationError, createAuthError } from '@/contexts/ErrorContext';

/**
 * Demo component to showcase the error handling system
 */
export default function ErrorDemo() {
  const { addError, dismissAllErrors, clearErrors } = useError();

  // Example handlers for different error types
  const handleInfoError = () => {
    addError({
      message: 'This is an informational message',
      severity: ErrorSeverity.INFO,
      type: ErrorType.UNKNOWN,
      componentName: 'ErrorDemo',
    });
  };

  const handleWarningError = () => {
    addError({
      message: 'Warning: This action might have consequences',
      severity: ErrorSeverity.WARNING,
      type: ErrorType.VALIDATION,
      componentName: 'ErrorDemo',
    });
  };

  const handleStandardError = () => {
    addError({
      message: 'An error occurred while processing your request',
      details: 'Error details: Request failed with status 500',
      severity: ErrorSeverity.ERROR,
      type: ErrorType.API,
      componentName: 'ErrorDemo',
    });
  };

  const handleCriticalError = () => {
    addError({
      message: 'Critical system error: Unable to connect to database',
      details: 'Connection timeout after 30s',
      severity: ErrorSeverity.CRITICAL,
      type: ErrorType.NETWORK,
      componentName: 'ErrorDemo',
    });
  };

  // Using helper functions
  const handleApiError = () => {
    addError(createApiError(
      'Failed to fetch workouts',
      'GET /api/workouts returned 404',
      ErrorSeverity.ERROR
    ));
  };

  const handleValidationError = () => {
    addError(createValidationError(
      'Please fill in all required fields',
      'Missing: name, email'
    ));
  };

  const handleAuthError = () => {
    addError(createAuthError(
      'Your session has expired. Please log in again.',
      'Token expired at 2023-06-15T12:00:00Z'
    ));
  };

  // Simulating an error boundary trigger
  const handleTriggerErrorBoundary = () => {
    throw new Error('This error will be caught by the ErrorBoundary component');
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Error Handling Demo</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Error Severity Levels</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleInfoError}
              className="px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
            >
              Info Error
            </button>
            <button
              onClick={handleWarningError}
              className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
            >
              Warning Error
            </button>
            <button
              onClick={handleStandardError}
              className="px-3 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
            >
              Standard Error
            </button>
            <button
              onClick={handleCriticalError}
              className="px-3 py-2 bg-red-200 text-red-900 rounded hover:bg-red-300 transition-colors"
            >
              Critical Error
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Helper Functions</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleApiError}
              className="px-3 py-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors"
            >
              API Error
            </button>
            <button
              onClick={handleValidationError}
              className="px-3 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
            >
              Validation Error
            </button>
            <button
              onClick={handleAuthError}
              className="px-3 py-2 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
            >
              Auth Error
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Error Boundary</h3>
          <button
            onClick={handleTriggerErrorBoundary}
            className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
          >
            Trigger Error Boundary
          </button>
          <p className="text-sm text-gray-500 mt-1">
            This will crash the component and be caught by the nearest ErrorBoundary
          </p>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Error Management</h3>
          <div className="flex space-x-2">
            <button
              onClick={dismissAllErrors}
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
            >
              Dismiss All Errors
            </button>
            <button
              onClick={clearErrors}
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
            >
              Clear All Errors
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
        <p className="font-medium">How to use in your components:</p>
        <pre className="mt-2 overflow-x-auto p-2 bg-gray-100 dark:bg-gray-800 rounded">
{`// Import the hook and types
import { useError, ErrorSeverity, ErrorType } from '@/contexts/ErrorContext';

// Use the hook in your component
const { addError } = useError();

// Add an error when something goes wrong
try {
  // Your code that might fail
} catch (error) {
  addError({
    message: error.message,
    details: error.stack,
    severity: ErrorSeverity.ERROR,
    type: ErrorType.API,
    componentName: 'YourComponent',
  });
}`}
        </pre>
      </div>
    </div>
  );
} 