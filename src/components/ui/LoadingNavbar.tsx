'use client';

import React from 'react';

export default function LoadingNavbar() {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Mamuk
              </span>
            </div>
          </div>
          
          {/* Skeleton loading for nav links */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="ml-10 flex items-center space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Skeleton loading for mobile menu button */}
          <div className="md:hidden">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </nav>
  );
} 