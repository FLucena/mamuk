import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for client-side error reporting
 * This should be called in a client component
 */
export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      // Performance monitoring
      tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
      // Session replay for better error context
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
    });
  }
}

/**
 * Report an error to Sentry with additional context
 * @param error The error to report
 * @param context Additional context to include with the error
 */
export function reportError(error: Error, context?: Record<string, any>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    // Fallback to console in development or if Sentry is not configured
    console.error('Error:', error, 'Context:', context);
  }
}

/**
 * Set user information for Sentry to associate errors with specific users
 * @param user User information
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

/**
 * Clear user information from Sentry when a user logs out
 */
export function clearUserContext() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

/**
 * Set additional tags for better error categorization
 * @param tags Key-value pairs for tagging errors
 */
export function setTags(tags: Record<string, string>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }
}

/**
 * Start a performance measurement
 * @param name Measurement name
 */
export function startPerformanceMeasurement(name: string) {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${name}-start`);
    
    return {
      end: () => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const entries = performance.getEntriesByName(name);
        const duration = entries.length > 0 ? entries[0].duration : 0;
        
        // Report to Sentry if available
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
          Sentry.setTag(`performance.${name}`, `${duration.toFixed(2)}ms`);
        }
        
        return duration;
      }
    };
  }
  
  // Fallback for environments without performance API
  return {
    end: () => 0
  };
} 