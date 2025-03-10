'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { clearNavigationHistory } from '@/lib/navigationUtils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch and handle errors in the React component tree
 * Particularly useful for catching and recovering from navigation-related errors
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });
    
    // Clear navigation history to help break potential loops
    clearNavigationHistory();
    
    // Log navigation-specific errors
    if (error.message.includes('navigation') || error.message.includes('redirect')) {
      console.warn('Navigation-related error detected, clearing navigation state');
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise, render a default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Algo salió mal
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              La aplicación ha encontrado un error inesperado.
            </p>
            {this.state.error && (
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded mb-4 overflow-auto max-h-40">
                <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <button
              onClick={this.resetError}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => {
                this.resetError();
                window.location.href = '/';
              }}
              className="w-full mt-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 