'use client';

import { useState } from 'react';
import { useLoadingSpinner } from '@/hooks/useLoadingSpinner';

/**
 * Example component demonstrating different ways to use the global spinner
 */
export default function SpinnerExample() {
  const { showSpinner, hideSpinner, executeWithSpinner, wrapWithSpinner } = useLoadingSpinner();
  const [result, setResult] = useState<string>('');

  // Simulate an API call
  const simulateApiCall = async (delay: number = 2000): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`API call completed after ${delay}ms`);
      }, delay);
    });
  };

  // Method 1: Manual show/hide
  const handleManualSpinner = async () => {
    showSpinner();
    try {
      const data = await simulateApiCall();
      setResult(data);
    } finally {
      hideSpinner();
    }
  };

  // Method 2: Using executeWithSpinner
  const handleExecuteWithSpinner = async () => {
    const data = await executeWithSpinner(async () => {
      return simulateApiCall(3000);
    });
    setResult(data);
  };

  // Method 3: Using wrapWithSpinner
  const wrappedApiCall = wrapWithSpinner(simulateApiCall);
  const handleWrappedCall = async () => {
    const data = await wrappedApiCall(1500);
    setResult(data);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Global Spinner Examples</h2>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={handleManualSpinner}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Manual Show/Hide
          </button>
          <p className="text-sm text-gray-500 mt-1">
            Manually shows and hides the spinner
          </p>
        </div>
        
        <div>
          <button
            onClick={handleExecuteWithSpinner}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Execute With Spinner
          </button>
          <p className="text-sm text-gray-500 mt-1">
            Executes a callback with the spinner shown
          </p>
        </div>
        
        <div>
          <button
            onClick={handleWrappedCall}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Wrapped Function
          </button>
          <p className="text-sm text-gray-500 mt-1">
            Calls a function wrapped with the spinner
          </p>
        </div>
      </div>
      
      {result && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h3 className="font-medium mb-2">Result:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
} 