'use client';

import { useNavigationSpinner } from '@/hooks/useNavigationSpinner';

/**
 * Component that handles showing the spinner during navigation
 * This is a utility component with no UI - it just sets up the navigation spinner
 */
export default function NavigationSpinnerHandler() {
  // Set up the navigation spinner with custom options
  useNavigationSpinner({
    delay: 300, // Show spinner after 300ms of navigation start
    minDuration: 500, // Show spinner for at least 500ms
  });

  // This component doesn't render anything
  return null;
} 