/**
 * Redirect Logger
 * 
 * This utility provides functions to log and analyze redirects for debugging purposes.
 * It helps identify unnecessary redirects and redirect loops.
 */

// Store redirect logs
interface RedirectLog {
  timestamp: number;
  from: string;
  to: string;
  source: string;
  sessionStatus: string;
  success: boolean;
}

const redirectLogs: RedirectLog[] = [];
const MAX_LOGS = 100;

/**
 * Log a redirect attempt
 * @param from Source path
 * @param to Destination path
 * @param source Component or function that triggered the redirect
 * @param sessionStatus Session status (authenticated, unauthenticated, loading)
 * @param success Whether the redirect was successful
 */
export function logRedirect(
  from: string,
  to: string,
  source: string,
  sessionStatus: string,
  success: boolean
): void {
  // Add to logs
  redirectLogs.push({
    timestamp: Date.now(),
    from,
    to,
    source,
    sessionStatus,
    success
  });
  
  // Trim logs if they get too long
  if (redirectLogs.length > MAX_LOGS) {
    redirectLogs.shift();
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Redirect] ${success ? 'SUCCESS' : 'SKIPPED'} | ${from} -> ${to} | Source: ${source} | Session: ${sessionStatus}`
    );
  }
}

/**
 * Get all redirect logs
 * @returns Array of redirect logs
 */
export function getRedirectLogs(): RedirectLog[] {
  return [...redirectLogs];
}

/**
 * Clear all redirect logs
 */
export function clearRedirectLogs(): void {
  redirectLogs.length = 0;
}

/**
 * Analyze redirect patterns to identify potential issues
 * @returns Analysis results
 */
export function analyzeRedirects(): {
  totalRedirects: number;
  successfulRedirects: number;
  skippedRedirects: number;
  potentialLoops: { pattern: string; count: number }[];
  mostFrequentSources: { source: string; count: number }[];
} {
  const totalRedirects = redirectLogs.length;
  const successfulRedirects = redirectLogs.filter(log => log.success).length;
  const skippedRedirects = totalRedirects - successfulRedirects;
  
  // Identify potential loops
  const patterns: Record<string, number> = {};
  for (let i = 0; i < redirectLogs.length - 1; i++) {
    const current = redirectLogs[i];
    const next = redirectLogs[i + 1];
    
    if (current.to === next.from && next.to === current.from) {
      const pattern = `${current.from} <-> ${current.to}`;
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    }
  }
  
  const potentialLoops = Object.entries(patterns)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count);
  
  // Identify most frequent sources
  const sources: Record<string, number> = {};
  for (const log of redirectLogs) {
    sources[log.source] = (sources[log.source] || 0) + 1;
  }
  
  const mostFrequentSources = Object.entries(sources)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    totalRedirects,
    successfulRedirects,
    skippedRedirects,
    potentialLoops,
    mostFrequentSources
  };
} 