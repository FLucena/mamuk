'use client';

import { useState, useEffect } from 'react';
import { getRedirectLogs, analyzeRedirects, clearRedirectLogs } from '@/utils/redirectLogger';
import { redirectService } from '@/utils/redirectService';

interface RedirectSource {
  source: string;
  count: number;
}

interface PotentialLoop {
  pattern: string;
  count: number;
}

interface RedirectAnalysis {
  totalRedirects: number;
  successfulRedirects: number;
  skippedRedirects: number;
  mostFrequentSources: RedirectSource[];
  potentialLoops: PotentialLoop[];
}

interface RedirectLog {
  timestamp: number;
  from: string;
  to: string;
  source: string;
  sessionStatus: string;
  success: boolean;
}

export default function RedirectDebugPage() {
  const [logs, setLogs] = useState<RedirectLog[]>([]);
  const [analysis, setAnalysis] = useState<RedirectAnalysis | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Get logs and analysis
    setLogs(getRedirectLogs());
    setAnalysis(analyzeRedirects());
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClear = () => {
    clearRedirectLogs();
    redirectService.clearHistory();
    handleRefresh();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Redirect Debug</h1>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
        <button 
          onClick={handleClear}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Logs
        </button>
      </div>
      
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="border p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="space-y-2">
              <p><strong>Total Redirects:</strong> {analysis.totalRedirects}</p>
              <p><strong>Successful Redirects:</strong> {analysis.successfulRedirects}</p>
              <p><strong>Skipped Redirects:</strong> {analysis.skippedRedirects}</p>
            </div>
          </div>
          
          <div className="border p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Most Frequent Sources</h2>
            {analysis.mostFrequentSources.length > 0 ? (
              <ul className="space-y-2">
                {analysis.mostFrequentSources.map((source: RedirectSource, index: number) => (
                  <li key={index}>
                    <strong>{source.source}:</strong> {source.count} redirects
                  </li>
                ))}
              </ul>
            ) : (
              <p>No data available</p>
            )}
          </div>
          
          <div className="border p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Potential Redirect Loops</h2>
            {analysis.potentialLoops.length > 0 ? (
              <ul className="space-y-2">
                {analysis.potentialLoops.map((loop: {pattern: string, count: number}, index: number) => (
                  <li key={index}>
                    <div className="text-red-600">Possible redirection loop:</div>
                    <div className="text-yellow-500">{loop.pattern}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No redirect loops detected</p>
            )}
          </div>
        </div>
      )}
      
      <div className="border p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Redirect Logs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.from}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.to}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.sessionStatus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${log.success ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {log.success ? 'Success' : 'Skipped'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No redirect logs available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 