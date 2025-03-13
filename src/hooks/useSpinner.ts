'use client';

// Extend the Window interface to include the globalSpinnerController
declare global {
  interface Window {
    globalSpinnerController?: {
      show: () => () => void;
      hide: () => void;
      isVisible: () => boolean;
    };
  }
}

/**
 * Hook to control the global spinner
 * @returns Object with methods to show and hide the spinner
 */
export function useSpinner() {
  const showSpinner = () => {
    if (typeof window !== 'undefined' && window.globalSpinnerController) {
      return window.globalSpinnerController.show();
    }
    return () => {}; // Return empty function if spinner controller is not available
  };

  const hideSpinner = () => {
    if (typeof window !== 'undefined' && window.globalSpinnerController) {
      window.globalSpinnerController.hide();
    }
  };

  const isSpinnerVisible = () => {
    if (typeof window !== 'undefined' && window.globalSpinnerController) {
      return window.globalSpinnerController.isVisible();
    }
    return false;
  };

  return {
    showSpinner,
    hideSpinner,
    isSpinnerVisible,
  };
} 