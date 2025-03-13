'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { reportError } from '@/lib/sentry';

// Define error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Define error types
export enum ErrorType {
  API = 'api',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

// Define error object structure
export interface AppError {
  id: string;
  message: string;
  details?: string;
  severity: ErrorSeverity;
  type: ErrorType;
  timestamp: Date;
  componentName?: string;
  dismissed: boolean;
}

// Define context state
interface ErrorState {
  errors: AppError[];
  hasErrors: boolean;
  hasCriticalErrors: boolean;
}

// Define context actions
type ErrorAction =
  | { type: 'ADD_ERROR'; payload: Omit<AppError, 'id' | 'timestamp' | 'dismissed'> }
  | { type: 'DISMISS_ERROR'; payload: { id: string } }
  | { type: 'DISMISS_ALL_ERRORS' }
  | { type: 'CLEAR_ERRORS' };

// Define context value
interface ErrorContextValue extends ErrorState {
  addError: (error: Omit<AppError, 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissError: (id: string) => void;
  dismissAllErrors: () => void;
  clearErrors: () => void;
}

// Create context
const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

// Create reducer
function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      const newError: AppError = {
        id: generateErrorId(),
        timestamp: new Date(),
        dismissed: false,
        ...action.payload,
      };
      return {
        ...state,
        errors: [...state.errors, newError],
        hasErrors: true,
        hasCriticalErrors: state.hasCriticalErrors || newError.severity === ErrorSeverity.CRITICAL,
      };
    case 'DISMISS_ERROR':
      return {
        ...state,
        errors: state.errors.map(error =>
          error.id === action.payload.id ? { ...error, dismissed: true } : error
        ),
        hasErrors: state.errors.some(error => error.id !== action.payload.id && !error.dismissed),
        hasCriticalErrors: state.errors.some(
          error => error.id !== action.payload.id && !error.dismissed && error.severity === ErrorSeverity.CRITICAL
        ),
      };
    case 'DISMISS_ALL_ERRORS':
      return {
        ...state,
        errors: state.errors.map(error => ({ ...error, dismissed: true })),
        hasErrors: false,
        hasCriticalErrors: false,
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
        hasErrors: false,
        hasCriticalErrors: false,
      };
    default:
      return state;
  }
}

// Helper function to generate unique error IDs
function generateErrorId(): string {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create provider
export function ErrorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(errorReducer, {
    errors: [],
    hasErrors: false,
    hasCriticalErrors: false,
  });

  // Add error
  const addError = (error: Omit<AppError, 'id' | 'timestamp' | 'dismissed'>) => {
    // Report to Sentry if it's an error or critical
    if (error.severity === ErrorSeverity.ERROR || error.severity === ErrorSeverity.CRITICAL) {
      const errorObj = new Error(error.message);
      if (error.details) {
        errorObj.stack = error.details;
      }
      reportError(errorObj, {
        errorType: error.type,
        severity: error.severity,
        componentName: error.componentName,
      });
    }
    
    dispatch({ type: 'ADD_ERROR', payload: error });
  };

  // Dismiss error
  const dismissError = (id: string) => {
    dispatch({ type: 'DISMISS_ERROR', payload: { id } });
  };

  // Dismiss all errors
  const dismissAllErrors = () => {
    dispatch({ type: 'DISMISS_ALL_ERRORS' });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  return (
    <ErrorContext.Provider
      value={{
        ...state,
        addError,
        dismissError,
        dismissAllErrors,
        clearErrors,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
}

// Create hook
export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

// Helper function to create API errors
export function createApiError(message: string, details?: string, severity = ErrorSeverity.ERROR) {
  return {
    message,
    details,
    severity,
    type: ErrorType.API,
  };
}

// Helper function to create validation errors
export function createValidationError(message: string, details?: string) {
  return {
    message,
    details,
    severity: ErrorSeverity.WARNING,
    type: ErrorType.VALIDATION,
  };
}

// Helper function to create authentication errors
export function createAuthError(message: string, details?: string) {
  return {
    message,
    details,
    severity: ErrorSeverity.ERROR,
    type: ErrorType.AUTHENTICATION,
  };
} 