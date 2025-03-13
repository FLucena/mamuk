'use client';

import { useState } from 'react';
import { logNavigationStats } from '@/lib/utils/debug';

export default function DebugButton() {
  const [expanded, setExpanded] = useState(false);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {expanded ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          <div className="flex justify-between mb-2">
            <h3 className="font-bold">Debug Tools</h3>
            <button 
              onClick={() => setExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => logNavigationStats()}
              className="w-full px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              Log Navigation Stats
            </button>
            <button
              onClick={() => {
                // Removed console.log
                sessionStorage.clear();
                window.location.reload();
              }}
              className="w-full px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded hover:bg-red-200 dark:hover:bg-red-800"
            >
              Reset Stats & Reload
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 p-2 rounded-full shadow-lg"
          aria-label="Debug Tools"
        >
          🐞
        </button>
      )}
    </div>
  );
} 