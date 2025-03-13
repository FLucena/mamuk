'use client';

import React from 'react';
import ErrorDemo from '@/components/ErrorDemo';
import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function ErrorDemoPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Error Handling System</h1>
      
      <div className="max-w-4xl mx-auto">
        <p className="text-lg text-center mb-8">
          This page demonstrates the comprehensive error handling system implemented in Mamuk.
          Try different error types to see how they are displayed and managed.
        </p>
        
        <div className="grid gap-8">
          {/* Regular Error Boundary */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">General Error Boundary</h2>
            <ErrorBoundary name="ErrorDemoSection">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <ErrorDemo />
              </div>
            </ErrorBoundary>
          </section>
          
          {/* API Error Boundary with retry */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">API Error Boundary (with retry)</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              This boundary is specifically designed for API requests and includes retry functionality.
            </p>
            <ApiErrorBoundary 
              maxRetries={3} 
              retryDelay={1000}
              apiName="ApiErrorDemoSection"
            >
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="p-6 bg-white dark:bg-gray-800">
                  <h3 className="text-xl font-medium mb-4">API Error Demo</h3>
                  <p className="mb-4">
                    This component is wrapped in an ApiErrorBoundary that will automatically
                    retry failed operations up to 3 times with a 1 second delay between attempts.
                  </p>
                  <button
                    onClick={() => {
                      throw new Error('API Error: Failed to fetch data');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Simulate API Error
                  </button>
                </div>
              </div>
            </ApiErrorBoundary>
          </section>
        </div>
      </div>
    </main>
  );
} 