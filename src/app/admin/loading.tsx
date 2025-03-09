'use client';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Skeleton for navigation */}
        <div className="bg-white dark:bg-gray-900 shadow-lg mb-8 rounded-lg">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-start items-center">
              <div className="flex space-x-1">
                <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                <div className="w-48 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                <div className="w-36 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skeleton for content */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/4 mb-8"></div>
            
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 