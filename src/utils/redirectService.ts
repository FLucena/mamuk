/**
 * Centralized Redirect Service
 * 
 * This service provides a single source of truth for handling redirects
 * throughout the application. It prevents redirect loops, debounces redirects,
 * and tracks redirect history.
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { logRedirect } from './redirectLogger';

// Track redirect history to prevent loops
const redirectHistory: string[] = [];
const MAX_REDIRECT_HISTORY = 10;

// Singleton service for managing redirects
export const redirectService = {
  lastRedirectTime: 0,
  isRedirecting: false,
  redirectDebounceTime: 1000, // 1 second debounce
  
  /**
   * Check if a redirect can be performed
   * @returns Whether a redirect can be performed
   */
  canRedirect(): boolean {
    const now = Date.now();
    return !this.isRedirecting && (now - this.lastRedirectTime > this.redirectDebounceTime);
  },
  
  /**
   * Check if we're already on the target page
   * @param path Target path
   * @returns Whether we're already on the target page
   */
  isCurrentPath(path: string): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.pathname === path;
  },
  
  /**
   * Check if a redirect would create a loop
   * @param from Source path
   * @param to Destination path
   * @returns Whether the redirect would create a loop
   */
  wouldCreateLoop(from: string, to: string): boolean {
    // Don't redirect to the same page
    if (from === to) return true;
    
    // Check for A->B->A->B pattern
    if (redirectHistory.length >= 3) {
      const pattern = `${from} -> ${to}`;
      const lastThree = redirectHistory.slice(-3);
      const occurrences = lastThree.filter(r => r === pattern).length;
      
      if (occurrences >= 1) {
        console.warn('Redirect loop detected:', [...lastThree, pattern]);
        return true;
      }
    }
    
    return false;
  },
  
  /**
   * Track a redirect in history
   * @param from Source path
   * @param to Destination path
   */
  trackRedirect(from: string, to: string): void {
    const entry = `${from} -> ${to}`;
    redirectHistory.push(entry);
    
    // Trim history if it gets too long
    if (redirectHistory.length > MAX_REDIRECT_HISTORY) {
      redirectHistory.shift();
    }
  },
  
  /**
   * Perform a redirect with debouncing and loop prevention
   * @param router Next.js router instance
   * @param path Target path
   * @param options Additional options
   * @returns Whether the redirect was performed
   */
  performRedirect(
    router: AppRouterInstance, 
    path: string,
    options: { force?: boolean; source?: string; sessionStatus?: string } = {}
  ): boolean {
    const { force = false, source = 'unknown', sessionStatus = 'unknown' } = options;
    const currentPath = this.isCurrentPath(path) ? path : (typeof window !== 'undefined' ? window.location.pathname : 'unknown');
    
    // MODIFIED: Never redirect to unauthorized page, redirect to signin instead
    let finalPath = path;
    if (finalPath === '/unauthorized') {
      console.log(`[RedirectService] Redirecting from ${currentPath} to /auth/signin instead of /unauthorized`);
      finalPath = '/auth/signin';
    }
    
    // Skip if we're already on the target page
    if (currentPath === finalPath) {
      logRedirect(currentPath, finalPath, source, sessionStatus, false);
      return false;
    }
    
    // Check if we can redirect (unless forced)
    if (!force && !this.canRedirect()) {
      logRedirect(currentPath, finalPath, source, sessionStatus, false);
      return false;
    }
    
    // Check for redirect loops (unless forced)
    if (!force && this.wouldCreateLoop(currentPath, finalPath)) {
      logRedirect(currentPath, finalPath, source, sessionStatus, false);
      return false;
    }
    
    // Track the redirect
    this.trackRedirect(currentPath, finalPath);
    
    // Set redirect state
    this.isRedirecting = true;
    this.lastRedirectTime = Date.now();
    
    // Log the redirect
    logRedirect(currentPath, finalPath, source, sessionStatus, true);
    
    // Perform the redirect
    router.push(finalPath);
    
    // Reset the redirecting flag after a delay
    setTimeout(() => {
      this.isRedirecting = false;
    }, this.redirectDebounceTime);
    
    return true;
  },
  
  /**
   * Get the redirect history
   * @returns Array of redirect history entries
   */
  getHistory(): string[] {
    return [...redirectHistory];
  },
  
  /**
   * Clear the redirect history
   */
  clearHistory(): void {
    redirectHistory.length = 0;
  }
}; 