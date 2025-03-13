'use client';

import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { Menu } from 'lucide-react';
import Link from 'next/link';

/**
 * A specialized error boundary for the Navbar component
 * Provides a minimal fallback UI that still allows navigation
 */
const NavbarErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const handleError = (error: Error) => {
    // Log to your analytics or error tracking service
    console.error('Navbar error:', error);
  };

  // Custom fallback UI for navbar errors
  const fallbackUI = (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/workout"
              className="flex-shrink-0"
            >
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Mamuk
              </span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-red-600 dark:text-red-400 mr-2">
              Navigation error
            </span>
            <Link 
              href="/workout"
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <ErrorBoundary fallback={fallbackUI} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default NavbarErrorBoundary; 