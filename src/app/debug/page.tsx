'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Debug index page that links to all debug pages
 * Only available in development mode
 */
export default function DebugIndexPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Session Debug */}
        <Link href="/debug/session" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Session Debug</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor session performance, cache stats, and session data
            </p>
          </div>
        </Link>
        
        {/* Redirect Debug */}
        <Link href="/debug/redirects" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Redirect Debug</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track redirects, analyze patterns, and detect potential loops
            </p>
          </div>
        </Link>
        
        {/* Add more debug tools as they become available */}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          Developer Tools Only
        </h3>
        <p className="text-yellow-700 dark:text-yellow-300">
          These debug tools are only available in development mode and should not be used in production.
        </p>
      </div>
    </div>
  );
} 