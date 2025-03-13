'use client';

import { useEffect } from 'react';
import { initNavigationPatches } from '@/lib/utils/navigation';

/**
 * Client component that initializes navigation patches
 * This component should be included in the app layout
 */
export default function NavigationPatcher() {
  useEffect(() => {
    // Initialize navigation patches when the component mounts
    initNavigationPatches();
  }, []);

  // This component doesn't render anything
  return null;
} 