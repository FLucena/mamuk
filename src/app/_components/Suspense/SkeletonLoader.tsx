/**
 * Skeleton loader components for use with Suspense
 * These components provide visual placeholders while content is loading
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Base skeleton component with pulse animation
 */
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Text line skeleton
 */
export function TextSkeleton({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-4 rounded w-full" 
          style={{ width: `${Math.random() * 40 + 60}%` }} 
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton
 */
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <Skeleton className="h-4 w-3/4 mb-4" />
      <TextSkeleton lines={3} className="mb-4" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

/**
 * Avatar skeleton
 */
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
}

/**
 * Profile skeleton with avatar and text
 */
export function ProfileSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <AvatarSkeleton />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="p-4 grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
