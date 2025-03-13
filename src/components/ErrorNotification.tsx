'use client';

import React, { useEffect, useState } from 'react';
import { useError, ErrorSeverity, ErrorType } from '@/contexts/ErrorContext';
import { AlertCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

/**
 * Component to display error notifications from the global error state
 */
export default function ErrorNotification() {
  const { errors, dismissError } = useError();
  const [visibleErrors, setVisibleErrors] = useState<string[]>([]);
  
  // Only show non-dismissed errors
  const activeErrors = errors.filter(error => !error.dismissed);
  
  // Handle animation of errors
  useEffect(() => {
    // Add new errors to visible errors with a slight delay for animation
    const newErrorIds = activeErrors
      .map(error => error.id)
      .filter(id => !visibleErrors.includes(id));
    
    if (newErrorIds.length > 0) {
      // Add new errors with a slight delay for staggered animation
      newErrorIds.forEach((id, index) => {
        setTimeout(() => {
          setVisibleErrors(prev => [...prev, id]);
        }, index * 100);
      });
    }
    
    // Remove errors that are no longer active
    const removedErrorIds = visibleErrors.filter(
      id => !activeErrors.some(error => error.id === id)
    );
    
    if (removedErrorIds.length > 0) {
      setVisibleErrors(prev => 
        prev.filter(id => !removedErrorIds.includes(id))
      );
    }
  }, [activeErrors, visibleErrors]);
  
  if (activeErrors.length === 0) {
    return null;
  }
  
  // Get icon based on severity
  const getIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.INFO:
        return <Info className="h-5 w-5 text-blue-500" />;
      case ErrorSeverity.WARNING:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case ErrorSeverity.ERROR:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case ErrorSeverity.CRITICAL:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get background color based on severity
  const getBackgroundColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case ErrorSeverity.WARNING:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case ErrorSeverity.ERROR:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case ErrorSeverity.CRITICAL:
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };
  
  // Get text color based on severity
  const getTextColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'text-blue-800 dark:text-blue-300';
      case ErrorSeverity.WARNING:
        return 'text-yellow-800 dark:text-yellow-300';
      case ErrorSeverity.ERROR:
        return 'text-red-800 dark:text-red-300';
      case ErrorSeverity.CRITICAL:
        return 'text-red-900 dark:text-red-200';
      default:
        return 'text-gray-800 dark:text-gray-300';
    }
  };
  
  // Get error type label
  const getErrorTypeLabel = (type: ErrorType) => {
    switch (type) {
      case ErrorType.API:
        return 'API Error';
      case ErrorType.VALIDATION:
        return 'Validation Error';
      case ErrorType.AUTHENTICATION:
        return 'Authentication Error';
      case ErrorType.AUTHORIZATION:
        return 'Authorization Error';
      case ErrorType.NETWORK:
        return 'Network Error';
      default:
        return 'Error';
    }
  };
  
  // Handle dismissing an error with animation
  const handleDismiss = (errorId: string) => {
    // First remove from visible errors (triggers animation)
    setVisibleErrors(prev => prev.filter(id => id !== errorId));
    
    // Then dismiss from global state after animation completes
    setTimeout(() => {
      dismissError(errorId);
    }, 300);
  };
  
  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-md">
      {activeErrors.map(error => (
        <div
          key={error.id}
          className={`p-4 rounded-lg shadow-lg border ${getBackgroundColor(error.severity)} 
            transition-all duration-300 ease-in-out
            ${visibleErrors.includes(error.id) 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
            }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(error.severity)}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-start">
                <h3 className={`text-sm font-medium ${getTextColor(error.severity)}`}>
                  {getErrorTypeLabel(error.type)}
                </h3>
                <button
                  type="button"
                  className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500"
                  onClick={() => handleDismiss(error.id)}
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className={`mt-1 text-sm ${getTextColor(error.severity)}`}>
                <p>{error.message}</p>
                {error.details && process.env.NODE_ENV === 'development' && (
                  <pre className="mt-1 text-xs bg-white/50 dark:bg-black/20 p-1 rounded overflow-auto max-h-20">
                    {error.details}
                  </pre>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {new Date(error.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 