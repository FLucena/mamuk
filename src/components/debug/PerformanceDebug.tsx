'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Clock, Zap, AlertTriangle } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: string | number;
  threshold?: number;
  unit?: string;
}

interface ResourceMetric {
  name: string;
  duration: number;
  initiatorType: string;
  timestamp: number;
}

/**
 * Debug component for visualizing performance metrics
 * Only use in development or with ?debug=performance query parameter
 */
export default function PerformanceDebug() {
  const [visible, setVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [slowResources, setSlowResources] = useState<ResourceMetric[]>([]);
  const [sessionCalls, setSessionCalls] = useState<ResourceMetric[]>([]);
  
  useEffect(() => {
    // Only show in development or with debug parameter
    const isDev = process.env.NODE_ENV === 'development';
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');
    
    if (isDev || debugParam === 'performance') {
      setVisible(true);
      collectMetrics();
      
      // Set up observer for slow resources
      observeResourceTiming();
    }
  }, []);
  
  const collectMetrics = () => {
    const perf = window.performance;
    if (!perf) return;
    
    const navigationStart = perf.timing.navigationStart;
    const now = Date.now();
    
    // Collect navigation timing metrics
    const navMetrics: PerformanceMetric[] = [
      {
        name: 'Total Load Time',
        value: formatTime(perf.timing.loadEventEnd - navigationStart),
        threshold: 3000,
        unit: 'ms'
      },
      {
        name: 'DOM Content Loaded',
        value: formatTime(perf.timing.domContentLoadedEventEnd - navigationStart),
        threshold: 1000,
        unit: 'ms'
      },
      {
        name: 'First Paint',
        value: formatTime(getFirstPaint()),
        threshold: 1000,
        unit: 'ms'
      },
      {
        name: 'Time to First Byte',
        value: formatTime(perf.timing.responseStart - perf.timing.requestStart),
        threshold: 500,
        unit: 'ms'
      }
    ];
    
    // Add memory usage if available
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      navMetrics.push({
        name: 'JS Heap Size',
        value: formatSize(memory.usedJSHeapSize),
        threshold: 50 * 1024 * 1024, // 50MB
      });
    }
    
    setMetrics(navMetrics);
  };
  
  const observeResourceTiming = () => {
    // Create a PerformanceObserver to watch for resource timing entries
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        // Filter for slow resources (> 500ms)
        const slow = entries
          .filter(entry => 
            entry.duration > 500 && 
            entry.entryType === 'resource'
          )
          .map(entry => ({
            name: entry.name,
            duration: entry.duration,
            initiatorType: (entry as PerformanceResourceTiming).initiatorType,
            timestamp: Date.now()
          }));
        
        if (slow.length > 0) {
          setSlowResources(prev => [...slow, ...prev].slice(0, 10));
        }
        
        // Track session API calls specifically
        const sessionRequests = entries
          .filter(entry => 
            entry.name.includes('/api/auth/session') && 
            entry.entryType === 'resource'
          )
          .map(entry => ({
            name: entry.name,
            duration: entry.duration,
            initiatorType: (entry as PerformanceResourceTiming).initiatorType,
            timestamp: Date.now()
          }));
        
        if (sessionRequests.length > 0) {
          setSessionCalls(prev => [...sessionRequests, ...prev].slice(0, 10));
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      
      return () => observer.disconnect();
    }
  };
  
  // Helper to get first paint time
  const getFirstPaint = () => {
    const paintMetrics = performance.getEntriesByType('paint');
    const firstPaint = paintMetrics.find(metric => metric.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  };
  
  // Format time in ms
  const formatTime = (time: number) => {
    return `${time.toFixed(2)}ms`;
  };
  
  // Format size in KB/MB
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-lg rounded-tl-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      <div className="bg-blue-500 dark:bg-blue-600 text-white p-2 flex items-center justify-between">
        <div className="flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          <h3 className="text-sm font-medium">Performance Monitor</h3>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="mb-4">
          <h4 className="text-sm font-medium flex items-center mb-2 text-gray-700 dark:text-gray-300">
            <BarChart className="w-4 h-4 mr-1 text-blue-500" />
            Page Metrics
          </h4>
          <div className="space-y-2">
            {metrics.map((metric, index) => (
              <div key={index} className="text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{metric.name}</span>
                  <span className={`font-medium ${
                    metric.threshold && typeof metric.value === 'number' && metric.value > metric.threshold
                      ? 'text-red-500'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {metric.value} {metric.unit}
                  </span>
                </div>
                {metric.threshold && typeof metric.value === 'number' && (
                  <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
                    <div 
                      className={`h-1 rounded-full ${
                        metric.value > metric.threshold ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (metric.value / metric.threshold) * 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium flex items-center mb-2 text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4 mr-1 text-purple-500" />
            Session API Calls
          </h4>
          {sessionCalls.length > 0 ? (
            <div className="space-y-2 text-xs">
              {sessionCalls.map((resource, index) => (
                <div key={index} className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                      {resource.name.split('/').pop()}
                    </span>
                    <span className={`font-medium ${
                      resource.duration > 1000 ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {resource.duration.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                    {formatTimestamp(resource.timestamp)} • {resource.initiatorType}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              No session API calls detected yet.
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-sm font-medium flex items-center mb-2 text-gray-700 dark:text-gray-300">
            <AlertTriangle className="w-4 h-4 mr-1 text-amber-500" />
            Slow Resources
          </h4>
          {slowResources.length > 0 ? (
            <div className="space-y-2 text-xs">
              {slowResources.map((resource, index) => (
                <div key={index} className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                      {resource.name.split('/').pop()}
                    </span>
                    <span className={`font-medium ${
                      resource.duration > 1000 ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {resource.duration.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                    {formatTimestamp(resource.timestamp)} • {resource.initiatorType}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              No slow resources detected yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 