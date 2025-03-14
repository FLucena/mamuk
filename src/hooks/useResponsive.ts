'use client';

import { useState, useEffect } from 'react';
import { breakpoints } from '@/utils/responsive';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  breakpoint: Breakpoint;
  width: number;
  height: number;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    breakpoint: 'xs',
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine current breakpoint
      let currentBreakpoint: Breakpoint = 'xs';
      if (width >= parseInt(breakpoints['2xl'])) {
        currentBreakpoint = '2xl';
      } else if (width >= parseInt(breakpoints.xl)) {
        currentBreakpoint = 'xl';
      } else if (width >= parseInt(breakpoints.lg)) {
        currentBreakpoint = 'lg';
      } else if (width >= parseInt(breakpoints.md)) {
        currentBreakpoint = 'md';
      } else if (width >= parseInt(breakpoints.sm)) {
        currentBreakpoint = 'sm';
      }
      
      setState({
        isMobile: width < parseInt(breakpoints.md),
        isTablet: width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg),
        isDesktop: width >= parseInt(breakpoints.lg),
        isLargeDesktop: width >= parseInt(breakpoints.xl),
        breakpoint: currentBreakpoint,
        width,
        height,
      });
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}

export default useResponsive; 