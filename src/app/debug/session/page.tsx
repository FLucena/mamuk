'use client';

import React, { useState, useEffect } from 'react';
import { sessionCache } from '@/utils/sessionCache';
import { useLightSession } from '@/hooks/useOptimizedSession';

/**
 * Debug page for monitoring session performance
 * Only available in development mode
 */
export default function SessionDebugPage() {
  const { data: session, status } = useLightSession();
  const [stats, setStats] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch session stats
  useEffect(() => {
    // Get stats from the session cache
    const cacheStats = sessionCache.getStats();
    setStats(cacheStats);
    
    // Fetch the current session data
    const fetchSession = async () => {
      try {
        const data = await sessionCache.getSession();
        setSessionData(data);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    
    fetchSession();
  }, [refreshKey]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Handle clear cache button click
  const handleClearCache = () => {
    sessionCache.clearCache();
    setRefreshKey(prev => prev + 1);
  };
  
  // Format time in ms
  const formatTime = (time: number) => {
    if (time < 100) {
      return `${time.toFixed(2)}ms (fast)`;
    } else if (time < 300) {
      return `${time.toFixed(2)}ms (good)`;
    } else if (time < 500) {
      return `${time.toFixed(2)}ms (slow)`;
    } else {
      return `${time.toFixed(2)}ms (very slow)`;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Session Performance Debug</h1>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Stats
        </button>
        <button 
          onClick={handleClearCache}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Cache
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Cache Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Session Cache Stats</h2>
          
          {stats ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">Cache Hits:</div>
                <div className="font-medium">{stats.hits}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">Cache Misses:</div>
                <div className="font-medium">{stats.misses}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">Hit Rate:</div>
                <div className="font-medium">
                  {stats.requestCount > 0 
                    ? `${Math.round((stats.hits / stats.requestCount) * 100)}%` 
                    : '0%'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">Total Requests:</div>
                <div className="font-medium">{stats.requestCount}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">Errors:</div>
                <div className="font-medium">{stats.errors}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">Average Time:</div>
                <div className="font-medium">
                  {stats.requestCount > 0 
                    ? formatTime(stats.totalTime / stats.requestCount)
                    : 'N/A'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">Slowest Request:</div>
                <div className="font-medium">
                  {stats.slowestRequest > 0 
                    ? formatTime(stats.slowestRequest)
                    : 'N/A'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">Fastest Request:</div>
                <div className="font-medium">
                  {stats.fastestRequest 
                    ? formatTime(stats.fastestRequest)
                    : 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading stats...</div>
          )}
        </div>
        
        {/* Current Session */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          
          <div className="mb-4">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Status:</div>
            <div className={`font-medium ${
              status === 'authenticated' 
                ? 'text-green-600 dark:text-green-400' 
                : status === 'loading' 
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400'
            }`}>
              {status}
            </div>
          </div>
          
          {session?.user ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">User ID:</div>
                <div className="font-medium">{session.user.id}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">Email:</div>
                <div className="font-medium">{session.user.email}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600 dark:text-gray-400">Roles:</div>
                <div className="font-medium">
                  {Array.isArray(session.user.roles) 
                    ? session.user.roles.join(', ') 
                    : 'None'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">
              {status === 'loading' ? 'Loading session...' : 'No active session'}
            </div>
          )}
        </div>
      </div>
      
      {/* Raw Session Data */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Raw Session Data</h2>
        
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96">
          {sessionData ? JSON.stringify(sessionData, null, 2) : 'Loading...'}
        </pre>
      </div>
    </div>
  );
} 