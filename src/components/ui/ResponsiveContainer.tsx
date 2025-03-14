'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
  as?: React.ElementType;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: boolean;
}

export default function ResponsiveContainer({
  children,
  className,
  fluid = false,
  as: Component = 'div',
  maxWidth = 'xl',
  padding = true,
}: ResponsiveContainerProps) {
  const containerClass = cn(
    fluid ? 'container-fluid' : 'container',
    {
      'px-4 sm:px-6 lg:px-8': padding,
      'max-w-sm': maxWidth === 'sm',
      'max-w-md': maxWidth === 'md',
      'max-w-lg': maxWidth === 'lg',
      'max-w-xl': maxWidth === 'xl',
      'max-w-2xl': maxWidth === '2xl',
      'max-w-full': maxWidth === 'full',
      'max-w-none': maxWidth === 'none',
    },
    className
  );

  return <Component className={containerClass}>{children}</Component>;
} 