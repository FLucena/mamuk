'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getNavigationStats, logNavigationStats } from '@/lib/utils/debug';

/**
 * A debug component that displays render counts for tracked components
 * Only visible in development mode
 */
export default function DebugRenderCounter() {
  const [stats, setStats] = useState<Record<string, any>>({});
  const [visible, setVisible] = useState(false);
  const [renderPhases, setRenderPhases] = useState<Record<string, string[]>>({});
  const renderPhasesRef = useRef<Record<string, string[]>>({});
  const originalConsoleLogRef = useRef<typeof console.log | null>(null);
  
  // Create a stable callback for the console.log override
  const handleConsoleLog = useCallback(function(...args: unknown[]) {
    // Look for React render phase logs
    if (typeof args[0] === 'string') {
      const message = args[0];
      let shouldUpdateState = false;
      
      // Check for component render logs
      if (message.includes('[RENDER]')) {
        const componentMatch = message.match(/\[RENDER\] (\w+)/);
        if (componentMatch && componentMatch[1]) {
          const componentName = componentMatch[1];
          const timestamp = new Date().toISOString().substr(11, 12);
          
          // Store the render phase
          if (!renderPhasesRef.current[componentName]) {
            renderPhasesRef.current[componentName] = [];
          }
          
          renderPhasesRef.current[componentName].push(`${timestamp} - Render`);
          
          // Keep only the last 10 phases
          if (renderPhasesRef.current[componentName].length > 10) {
            renderPhasesRef.current[componentName].shift();
          }
          
          shouldUpdateState = true;
        }
      }
      
      // Check for debug logs
      if (message.includes('[DEBUG]')) {
        const componentMatch = message.match(/\[DEBUG\] (\w+)/);
        if (componentMatch && componentMatch[1]) {
          const componentName = componentMatch[1];
          const timestamp = new Date().toISOString().substr(11, 12);
          const changeType = message.includes('Auth state') ? 'Auth changed' :
                            message.includes('Session') ? 'Session changed' :
                            message.includes('Pathname') ? 'Path changed' :
                            message.includes('Theme') ? 'Theme changed' : 'State changed';
          
          // Store the render phase
          if (!renderPhasesRef.current[componentName]) {
            renderPhasesRef.current[componentName] = [];
          }
          
          renderPhasesRef.current[componentName].push(`${timestamp} - ${changeType}`);
          
          // Keep only the last 10 phases
          if (renderPhasesRef.current[componentName].length > 10) {
            renderPhasesRef.current[componentName].shift();
          }
          
          shouldUpdateState = true;
        }
      }
      
      // Check for lifecycle logs
      if (message.includes('[LIFECYCLE]')) {
        const componentMatch = message.match(/\[LIFECYCLE\] (\w+)/);
        if (componentMatch && componentMatch[1]) {
          const componentName = componentMatch[1];
          const timestamp = new Date().toISOString().substr(11, 12);
          const lifecycle = message.includes('Mounted') ? 'Mounted' : 
                           message.includes('Unmounted') ? 'Unmounted' : 'Lifecycle event';
          
          // Store the render phase
          if (!renderPhasesRef.current[componentName]) {
            renderPhasesRef.current[componentName] = [];
          }
          
          renderPhasesRef.current[componentName].push(`${timestamp} - ${lifecycle}`);
          
          // Keep only the last 10 phases
          if (renderPhasesRef.current[componentName].length > 10) {
            renderPhasesRef.current[componentName].shift();
          }
          
          shouldUpdateState = true;
        }
      }
      
      // Batch state updates to prevent multiple renders
      if (shouldUpdateState) {
        // Use requestAnimationFrame to batch updates outside of render cycle
        requestAnimationFrame(() => {
          setRenderPhases({...renderPhasesRef.current});
        });
      }
    }
    
    // Call the original console.log
    if (originalConsoleLogRef.current) {
      originalConsoleLogRef.current.apply(console, args);
    }
  }, []);
  
  // Track React render phases
  useEffect(() => {
    // Monkey patch React's development mode to track render phases
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      originalConsoleLogRef.current = console.log;
      console.log = handleConsoleLog;
      
      return () => {
        if (originalConsoleLogRef.current) {
          console.log = originalConsoleLogRef.current;
        }
      };
    }
  }, [handleConsoleLog]);
  
  useEffect(() => {
    // Update stats every second
    const interval = setInterval(() => {
      setStats(getNavigationStats());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg"
        title="Show render stats"
      >
        📊
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-900 dark:text-white">Render Stats</h3>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-semibold text-sm">Render Counts</h4>
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">{key}</span>
              <span className="text-sm font-mono text-gray-900 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-2">
          <h4 className="font-semibold text-sm">Render Phases</h4>
          {Object.entries(renderPhases).map(([component, phases]) => (
            <div key={component} className="mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{component}</div>
              <div className="pl-2 border-l-2 border-blue-500 mt-1">
                {phases.map((phase, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                    {phase}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            logNavigationStats();
            // Removed console.log
            // Removed console.log
          }}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Log to console
        </button>
      </div>
    </div>
  );
} 