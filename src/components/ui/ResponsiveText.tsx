'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  responsive?: boolean;
}

export default function ResponsiveText({
  children,
  className,
  as: Component = 'p',
  responsive = true,
}: ResponsiveTextProps) {
  return (
    <Component
      className={cn(
        responsive && 'text-responsive',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function ResponsiveHeading1({
  children,
  className,
  responsive = true,
}: Omit<ResponsiveTextProps, 'as'>) {
  return (
    <ResponsiveText
      as="h1"
      className={cn(
        'text-3xl md:text-4xl lg:text-5xl font-bold',
        className
      )}
      responsive={responsive}
    >
      {children}
    </ResponsiveText>
  );
}

export function ResponsiveHeading2({
  children,
  className,
  responsive = true,
}: Omit<ResponsiveTextProps, 'as'>) {
  return (
    <ResponsiveText
      as="h2"
      className={cn(
        'text-2xl md:text-3xl lg:text-4xl font-bold',
        className
      )}
      responsive={responsive}
    >
      {children}
    </ResponsiveText>
  );
}

export function ResponsiveHeading3({
  children,
  className,
  responsive = true,
}: Omit<ResponsiveTextProps, 'as'>) {
  return (
    <ResponsiveText
      as="h3"
      className={cn(
        'text-xl md:text-2xl lg:text-3xl font-bold',
        className
      )}
      responsive={responsive}
    >
      {children}
    </ResponsiveText>
  );
}

export function ResponsiveParagraph({
  children,
  className,
  responsive = true,
}: Omit<ResponsiveTextProps, 'as'>) {
  return (
    <ResponsiveText
      as="p"
      className={cn(
        'text-base md:text-lg',
        className
      )}
      responsive={responsive}
    >
      {children}
    </ResponsiveText>
  );
} 