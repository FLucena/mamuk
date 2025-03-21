import React from 'react';
import { Award } from 'lucide-react';

export default function AwardsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-80 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="flex space-x-2">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative mb-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-100 dark:bg-gray-500 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center">
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <Award className="w-6 h-6 animate-bounce" />
          <span>Cargando reconocimientos...</span>
        </div>
      </div>
    </div>
  );
} 