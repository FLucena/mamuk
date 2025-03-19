'use client';
import { useEffect } from 'react';

/**
 * NavigationPatcher implementa soluciones para problemas comunes de navegación
 * - Previene el error de "Throttling navigation" limitando la frecuencia de navegaciones
 */

export interface NavigationPatcherProps {
  onNavigationChange?: (from: string, to: string) => void;
  debounceMs?: number;
}

export default function NavigationPatcher({
  onNavigationChange,
  debounceMs = 100
}: NavigationPatcherProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Store original methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    // Tracking state
    let pendingReplaceState: ReturnType<typeof setTimeout> | null = null;
    let pendingPushState: ReturnType<typeof setTimeout> | null = null;
    let lastUrl = window.location.href;
    
    // Patch replaceState
    window.history.replaceState = function patchedReplaceState(...args) {
      // Prevent double-firing
      if (pendingReplaceState) {
        clearTimeout(pendingReplaceState);
        pendingReplaceState = null;
      }

      // Apply original method
      const result = originalReplaceState.apply(this, args);
      
      // Debounce navigation change events
      // This helps with Next.js behavior where multiple replaceState calls may occur in quick succession
      pendingReplaceState = setTimeout(() => {
        if (onNavigationChange && lastUrl !== window.location.href) {
          onNavigationChange(lastUrl, window.location.href);
          lastUrl = window.location.href;
        }
        pendingReplaceState = null;
      }, debounceMs);
      
      return result;
    };
    
    // Patch pushState
    window.history.pushState = function patchedPushState(...args) {
      // Prevent double-firing
      if (pendingPushState) {
        clearTimeout(pendingPushState);
        pendingPushState = null;
      }
      
      // Apply original method
      const result = originalPushState.apply(this, args);
      
      // Debounce navigation change events
      pendingPushState = setTimeout(() => {
        if (onNavigationChange && lastUrl !== window.location.href) {
          onNavigationChange(lastUrl, window.location.href);
          lastUrl = window.location.href;
        }
        pendingPushState = null;
      }, debounceMs);
      
      return result;
    };
    
    // Handle back/forward browser navigation
    const handlePopState = () => {
      // Cancel any pending events
      if (pendingReplaceState) {
        clearTimeout(pendingReplaceState);
      }
      
      if (pendingPushState) {
        clearTimeout(pendingPushState);
      }
      
      // Notify change immediately for popstate (no debounce)
      if (onNavigationChange && lastUrl !== window.location.href) {
        onNavigationChange(lastUrl, window.location.href);
        lastUrl = window.location.href;
      }
    };
    
    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handlePopState);
    
    // Cleanup on unmount
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handlePopState);
      
      if (pendingPushState) clearTimeout(pendingPushState);
      if (pendingReplaceState) clearTimeout(pendingReplaceState);
    };
  }, [onNavigationChange, debounceMs]);

  // Este componente no renderiza nada
  return null;
} 