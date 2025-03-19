'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { runApiTests, testEndpoint, ApiTestResult, testAssignCustomersFlow } from '@/lib/test/api-test';

// Import the interface from the API test module
interface FlowTestResults {
  coachesTest: ApiTestResult;
  customersTest: ApiTestResult;
  assignTest: ApiTestResult;
  summary: {
    success: number;
    fail: number;
    total: number;
  };
}

export default function AdminDebugPage() {
  const { data: session, status } = useSession();
  const [customEndpoint, setCustomEndpoint] = useState('/api/admin/users?page=1&limit=10');
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [customResult, setCustomResult] = useState<ApiTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [flowResults, setFlowResults] = useState<FlowTestResults | null>(null);

  // Run initial tests on mount
  useEffect(() => {
    if (status === 'authenticated') {
      handleRunTests();
    }
  }, [status]);

  const handleRunTests = useCallback(async () => {
    setIsLoading(true);
    try {
      const testResults = await runApiTests();
      setResults(testResults);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTestCustomEndpoint = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await testEndpoint(customEndpoint);
      setCustomResult(result);
    } catch (error) {
      console.error('Error testing endpoint:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customEndpoint]);

  const handleTestCoachFlow = useCallback(async () => {
    if (!selectedCoachId) return;
    
    setIsLoading(true);
    try {
      const results = await testAssignCustomersFlow(selectedCoachId);
      setFlowResults(results);
    } catch (error) {
      console.error('Error testing coach flow:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCoachId]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status !== 'authenticated' || !session?.user?.roles?.includes('admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          No tienes permisos para acceder a esta página.
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Estado de sesión: {status}
        </p>
        <a 
          href="/auth/signin" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Iniciar Sesión
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        API Debugging
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Session Information
        </h2>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
          <pre className="text-sm text-gray-800 dark:text-gray-300">
            {JSON.stringify({
              authenticated: status === 'authenticated',
              user: session?.user ? {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                roles: session.user.roles,
              } : null
            }, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            API Endpoints Test
          </h2>
          
          <button
            onClick={handleRunTests}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white mb-4 ${
              isLoading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Running Tests...' : 'Run API Tests'}
          </button>
          
          {results.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                Results
              </h3>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border-b dark:border-gray-700">Endpoint</th>
                      <th className="text-left p-2 border-b dark:border-gray-700">Status</th>
                      <th className="text-left p-2 border-b dark:border-gray-700">Result</th>
                      <th className="text-left p-2 border-b dark:border-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className={result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        <td className="p-2 border-b dark:border-gray-700 font-mono">{result.endpoint}</td>
                        <td className="p-2 border-b dark:border-gray-700">{result.status} {result.statusText}</td>
                        <td className="p-2 border-b dark:border-gray-700">{result.success ? '✅' : '❌'}</td>
                        <td className="p-2 border-b dark:border-gray-700">{result.responseTime}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test Custom Endpoint
          </h2>
          
          <div className="mb-4">
            <label htmlFor="custom-endpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Endpoint
            </label>
            <input
              id="custom-endpoint"
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <button
            onClick={handleTestCustomEndpoint}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white mb-4 ${
              isLoading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Testing...' : 'Test Endpoint'}
          </button>
          
          {customResult && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                Result
              </h3>
              <div className={`p-3 rounded-md mb-2 ${
                customResult.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {customResult.status} {customResult.statusText} ({customResult.responseTime}ms)
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto max-h-96">
                <pre className="text-sm text-gray-800 dark:text-gray-300">
                  {JSON.stringify(customResult.data || customResult.error || 'No data', null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Test Coach-Customer Assignment Flow
        </h2>
        
        <div className="mb-4">
          <label htmlFor="coach-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Coach ID
          </label>
          <input
            id="coach-id"
            type="text"
            value={selectedCoachId}
            onChange={(e) => setSelectedCoachId(e.target.value)}
            placeholder="Enter coach user ID"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <button
          onClick={handleTestCoachFlow}
          disabled={isLoading || !selectedCoachId}
          className={`px-4 py-2 rounded-md text-white mb-4 ${
            isLoading || !selectedCoachId ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Testing Flow...' : 'Test Coach Flow'}
        </button>
        
        {flowResults && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
              Flow Results
            </h3>
            
            <div className={`p-3 rounded-md mb-2 ${
              flowResults.summary.fail === 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            }`}>
              {flowResults.summary.success} passing, {flowResults.summary.fail} failing (out of {flowResults.summary.total})
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto max-h-96">
              <pre className="text-sm text-gray-800 dark:text-gray-300">
                {JSON.stringify(flowResults, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Troubleshooting Tips
        </h2>
        
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>If you see <span className="font-semibold text-red-600 dark:text-red-400">401 Unauthorized</span> errors, check that you're properly authenticated and that cookies are being sent with requests.</li>
          <li>If you see <span className="font-semibold text-red-600 dark:text-red-400">403 Forbidden</span> errors, check that your user account has the correct role permissions (admin).</li>
          <li>If you see <span className="font-semibold text-red-600 dark:text-red-400">404 Not Found</span> errors, check that the API endpoint path is correct.</li>
          <li>Make sure that <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm">credentials: 'include'</code> is set in all fetch calls.</li>
          <li>Check browser developer tools for any CORS or cookie-related issues.</li>
        </ul>
      </div>
    </div>
  );
} 