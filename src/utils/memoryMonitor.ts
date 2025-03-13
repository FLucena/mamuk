/**
 * Memory monitoring utilities
 * Helps detect memory leaks and excessive memory usage
 */

// Extend Performance interface to include memory property
interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

declare global {
  interface Window {
    performance: ExtendedPerformance;
  }
}

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Store memory snapshots for trend analysis
const memoryHistory: MemorySnapshot[] = [];
const MAX_HISTORY_LENGTH = 10;

/**
 * Take a snapshot of current memory usage
 */
export function takeMemorySnapshot(): MemorySnapshot | null {
  if (typeof window === 'undefined' || !window.performance || !window.performance.memory) {
    return null;
  }
  
  const snapshot: MemorySnapshot = {
    timestamp: Date.now(),
    usedJSHeapSize: window.performance.memory.usedJSHeapSize,
    totalJSHeapSize: window.performance.memory.totalJSHeapSize,
    jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
  };
  
  // Add to history and maintain max length
  memoryHistory.push(snapshot);
  if (memoryHistory.length > MAX_HISTORY_LENGTH) {
    memoryHistory.shift();
  }
  
  return snapshot;
}

/**
 * Check if memory usage is increasing over time (potential leak)
 */
export function detectMemoryLeak(): boolean {
  if (memoryHistory.length < 3) return false;
  
  // Check if memory usage has been consistently increasing
  let isIncreasing = true;
  for (let i = 1; i < memoryHistory.length; i++) {
    if (memoryHistory[i].usedJSHeapSize <= memoryHistory[i-1].usedJSHeapSize) {
      isIncreasing = false;
      break;
    }
  }
  
  return isIncreasing;
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Start monitoring memory usage
 */
export function monitorMemoryUsage(intervalMs = 10000): () => void {
  if (typeof window === 'undefined' || !window.performance) return () => {};
  
  // Take initial snapshot
  takeMemorySnapshot();
  
  // Set up interval for monitoring
  const intervalId = setInterval(() => {
    const snapshot = takeMemorySnapshot();
    
    if (!snapshot) return;
    
    // Check for high memory usage (over 90% of limit)
    const usagePercentage = (snapshot.usedJSHeapSize / snapshot.jsHeapSizeLimit) * 100;
    
    if (usagePercentage > 90) {
      console.warn('[PERFORMANCE] High memory usage detected:', {
        used: formatBytes(snapshot.usedJSHeapSize),
        total: formatBytes(snapshot.totalJSHeapSize),
        limit: formatBytes(snapshot.jsHeapSizeLimit),
        percentage: usagePercentage.toFixed(1) + '%'
      });
    }
    
    // Check for potential memory leaks
    if (detectMemoryLeak()) {
      console.warn('[PERFORMANCE] Potential memory leak detected. Memory usage has been consistently increasing.');
      
      // Log memory history for debugging
      console.info('[PERFORMANCE] Memory history:', memoryHistory.map(snapshot => ({
        time: new Date(snapshot.timestamp).toISOString().substr(11, 8),
        used: formatBytes(snapshot.usedJSHeapSize)
      })));
    }
  }, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
} 