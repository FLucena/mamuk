'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  } | number;
  as?: React.ElementType;
}

export default function ResponsiveGrid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4, '2xl': 4 },
  gap = 4,
  as: Component = 'div',
}: ResponsiveGridProps) {
  // Convert gap to object if it's a number
  const gapObj = typeof gap === 'number' 
    ? { xs: gap, sm: gap, md: gap, lg: gap, xl: gap, '2xl': gap } 
    : gap;

  // Generate grid columns classes
  const gridColsClasses = [
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`,
  ].filter(Boolean);

  // Generate gap classes
  const gapClasses = [
    gapObj?.xs && `gap-${gapObj.xs}`,
    gapObj?.sm && `sm:gap-${gapObj.sm}`,
    gapObj?.md && `md:gap-${gapObj.md}`,
    gapObj?.lg && `lg:gap-${gapObj.lg}`,
    gapObj?.xl && `xl:gap-${gapObj.xl}`,
    gapObj?.['2xl'] && `2xl:gap-${gapObj['2xl']}`,
  ].filter(Boolean);

  return (
    <Component
      className={cn(
        'grid',
        ...gridColsClasses,
        ...gapClasses,
        className
      )}
    >
      {children}
    </Component>
  );
} 