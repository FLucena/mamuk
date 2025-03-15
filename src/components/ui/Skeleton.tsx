import { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton component for loading states
 * Uses Tailwind's pulse animation for a subtle loading effect
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse', className)}
      {...props}
    />
  );
} 