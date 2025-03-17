/**
 * Session cache utility to reduce redundant API calls to /api/auth/session
 * Implements:
 * 1. Request deduplication - prevents multiple simultaneous requests
 * 2. Session caching - reduces repeated API calls
 * 3. Performance monitoring - tracks session request times
 * 4. Background refresh - keeps session fresh without blocking UI
 * 5. Stale-while-revalidate pattern - serve cached data while refreshing
 */

// Cache timeout in milliseconds (15 minutes, up from 5)
const CACHE_TIMEOUT = 15 * 60 * 1000;

// Background refresh timeout (2 minutes before cache expiry)
const REFRESH_THRESHOLD = CACHE_TIMEOUT - (2 * 60 * 1000);

// Stats for monitoring
interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  totalTime: number;
  requestCount: number;
  lastRequestTime: number | null;
  slowestRequest: number;
  fastestRequest: number | null;
  backgroundRefreshes: number;
}

class SessionCache {
  private cache: any = null;
  private lastUpdated: number = 0;
  private pendingPromise: Promise<any> | null = null;
  private requestTimestamp: number | null = null;
  private refreshTimeoutId: NodeJS.Timeout | null = null;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    totalTime: 0,
    requestCount: 0,
    lastRequestTime: null,
    slowestRequest: 0,
    fastestRequest: null,
    backgroundRefreshes: 0
  };
  private initialized: boolean = false;
  private preloadStarted: boolean = false;

  constructor() {
    // Try to preload the session on initialization
    if (typeof window !== 'undefined') {
      // Use requestIdleCallback if available, or setTimeout as fallback
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => this.preloadSession(), { timeout: 500 });
      } else {
        // Delay slightly to allow other critical resources to load first
        setTimeout(() => this.preloadSession(), 100);
      }
      
      // Listen for visibility changes to refresh session when tab becomes visible
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  /**
   * Preload the session data in the background
   */
  private preloadSession(): void {
    if (this.preloadStarted) return;
    this.preloadStarted = true;
    
    // Only preload if we don't already have a cached session
    if (!this.cache && !this.pendingPromise) {
      console.info('[SessionCache] Preloading session data');
      this.getSession().catch(err => {
        console.error('[SessionCache] Preload error:', err);
      });
    }
  }
  
  /**
   * Handle visibility change to refresh session when tab becomes visible
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      // Check if the session is stale when the tab becomes visible
      const timeSinceUpdate = Date.now() - this.lastUpdated;
      if (this.cache && timeSinceUpdate > REFRESH_THRESHOLD && !this.pendingPromise) {
        console.info('[SessionCache] Refreshing session on tab visibility');
        this.refreshSessionInBackground();
      }
    }
  };

  /**
   * Refresh the session in the background without blocking
   */
  private refreshSessionInBackground(): void {
    if (this.pendingPromise) return;
    
    this.stats.backgroundRefreshes++;
    console.info('[SessionCache] Starting background refresh');
    
    // Start a new request and track its timestamp
    this.requestTimestamp = performance.now();
    
    // Create a new promise for the request
    this.pendingPromise = fetch('/api/auth/session', {
      // Add priority and cache control headers
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Priority': 'low'
      },
      // Include credentials for cookies
      credentials: 'same-origin'
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch session: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Update the cache with the new data
        this.cache = data;
        this.lastUpdated = Date.now();
        
        // Update metrics and schedule next refresh
        this.updateMetrics();
        this.scheduleNextRefresh();
        
        return data;
      })
      .catch(error => {
        console.error('[SessionCache] Error refreshing session:', error);
        this.stats.errors++;
        return this.cache; // Return existing cache on error
      })
      .finally(() => {
        // Clear the pending promise so future requests can proceed
        this.pendingPromise = null;
      });
  }

  /**
   * Schedule the next background refresh
   */
  private scheduleNextRefresh(): void {
    // Clear any existing timeout
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }
    
    // Schedule refresh just before cache expires
    this.refreshTimeoutId = setTimeout(() => {
      this.refreshSessionInBackground();
    }, REFRESH_THRESHOLD);
  }

  /**
   * Update performance metrics after a request
   */
  private updateMetrics(): void {
    if (this.requestTimestamp) {
      const requestTime = performance.now() - this.requestTimestamp;
      this.stats.totalTime += requestTime;
      this.stats.lastRequestTime = requestTime;
      
      // Track slowest/fastest
      if (requestTime > this.stats.slowestRequest) {
        this.stats.slowestRequest = requestTime;
      }
      if (this.stats.fastestRequest === null || requestTime < this.stats.fastestRequest) {
        this.stats.fastestRequest = requestTime;
      }
      
      // Log performance info
      console.info(`[SessionCache] Session loaded in ${requestTime.toFixed(2)}ms`);
      
      // Log detailed stats every 5 requests
      if (this.stats.requestCount % 5 === 0) {
        this.logStats();
      }
    }
  }

  /**
   * Get the cached session data or fetch it if needed
   * Implements stale-while-revalidate pattern
   */
  async getSession(): Promise<any> {
    // Track request for stats
    this.stats.requestCount++;
    
    // Check if cache exists but is near expiration
    const timeSinceUpdate = Date.now() - this.lastUpdated;
    const isNearExpiration = timeSinceUpdate > REFRESH_THRESHOLD;
    
    // If we have a valid cached session
    if (this.cache && (timeSinceUpdate < CACHE_TIMEOUT)) {
      this.stats.hits++;
      
      // If near expiration but not expired, trigger background refresh
      if (isNearExpiration && !this.pendingPromise) {
        // Use setTimeout to not block the current execution
        setTimeout(() => this.refreshSessionInBackground(), 0);
      }
      
      // Return cached data immediately
      return this.cache;
    }

    this.stats.misses++;

    // If there's already a request in progress, return that promise
    // This prevents multiple simultaneous requests
    if (this.pendingPromise) {
      console.info('[SessionCache] Reusing in-flight request');
      return this.pendingPromise;
    }

    // Start a new request and track its timestamp
    this.requestTimestamp = performance.now();
    
    // Create a new promise for the request
    this.pendingPromise = fetch('/api/auth/session', {
      // Add cache control headers to help browser caching
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Include credentials for cookies
      credentials: 'same-origin'
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch session: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Update the cache with the new data
        this.cache = data;
        this.lastUpdated = Date.now();
        
        // Update metrics and schedule next refresh
        this.updateMetrics();
        this.scheduleNextRefresh();
        
        this.initialized = true;
        return data;
      })
      .catch(error => {
        console.error('[SessionCache] Error fetching session:', error);
        this.stats.errors++;
        return null;
      })
      .finally(() => {
        // Clear the pending promise so future requests can proceed
        this.pendingPromise = null;
      });

    return this.pendingPromise;
  }

  /**
   * Manually update the cache with session data
   */
  updateCache(data: any): void {
    this.cache = data;
    this.lastUpdated = Date.now();
    
    // Schedule next refresh
    this.scheduleNextRefresh();
    
    console.info('[SessionCache] Cache manually updated');
  }

  /**
   * Clear the session cache
   */
  clearCache(): void {
    this.cache = null;
    this.lastUpdated = 0;
    
    // Clear refresh timeout
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    
    console.info('[SessionCache] Cache cleared');
  }

  /**
   * Get the timestamp of the most recent request
   */
  getRequestTimestamp(): number | null {
    return this.requestTimestamp;
  }

  /**
   * Check if the session is currently being fetched
   */
  isLoading(): boolean {
    return this.pendingPromise !== null;
  }
  
  /**
   * Check if the cache has been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  /**
   * Log cache statistics
   */
  logStats(): void {
    const avgTime = this.stats.requestCount > 0 
      ? this.stats.totalTime / this.stats.requestCount 
      : 0;
    
    console.info('[SessionCache] Stats:', {
      hits: this.stats.hits,
      misses: this.stats.misses,
      errors: this.stats.errors,
      backgroundRefreshes: this.stats.backgroundRefreshes,
      hitRate: `${this.stats.requestCount > 0 ? Math.round((this.stats.hits / this.stats.requestCount) * 100) : 0}%`,
      avgTime: `${avgTime.toFixed(2)}ms`,
      slowest: `${this.stats.slowestRequest.toFixed(2)}ms`,
      fastest: this.stats.fastestRequest ? `${this.stats.fastestRequest.toFixed(2)}ms` : 'N/A',
      cacheAge: this.lastUpdated > 0 ? `${((Date.now() - this.lastUpdated) / 1000).toFixed(1)}s` : 'N/A'
    });
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }
    
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
}

// Export a singleton instance
export const sessionCache = new SessionCache(); 