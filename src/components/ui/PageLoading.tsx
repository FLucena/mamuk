'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoadingProps {
  size?: number;
  label?: string;
  className?: string;
}

/**
 * PageLoading component that is centered both horizontally and vertically
 * on the page with proper full viewport height.
 */
export default function PageLoading({ 
  size = 32, 
  label = 'Cargando...', 
  className = '' 
}: PageLoadingProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 ${className}`}>
      <div className="flex flex-col items-center justify-center">
        <Loader2 
          size={size} 
          className="animate-spin text-blue-600 dark:text-blue-400" 
          aria-hidden="true"
        />
        {label && (
          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">{label}</p>
        )}
      </div>
    </div>
  );
} 