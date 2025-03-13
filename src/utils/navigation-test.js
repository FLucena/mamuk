'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function NavigationThrottlingTest() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [count, setCount] = useState(0);
  
  // Function to simulate rapid navigation
  const runTest = () => {
    setIsRunning(true);
    setLogs([]);
    setCount(0);
    
    // Record start time
    const startTime = performance.now();
    let navigationCount = 0;
    
    // For home page testing, we'll navigate between home and one other page
    const routes = [
      '/',
      '/about',
    ];
    
    // Function to perform a single navigation
    const performNavigation = (index) => {
      if (index >= 50 || !isRunning) {
        // Stop after 50 navigations or if test is stopped
        setIsRunning(false);
        setLogs(prev => [...prev, `Test completed. Performed ${navigationCount} navigations in ${((performance.now() - startTime) / 1000).toFixed(2)}s`]);
        return;
      }
      
      // Alternate between home and about to test home page specifically
      const route = index % 2 === 0 ? '/' : '/about';
      const timestamp = performance.now();
      
      try {
        // Log the navigation attempt
        setLogs(prev => [...prev, `${index + 1}. Navigating to ${route} at ${(timestamp - startTime).toFixed(2)}ms`]);
        
        // Perform the navigation
        router.push(route);
        navigationCount++;
        
        // Schedule the next navigation after a short delay
        setTimeout(() => {
          performNavigation(index + 1);
        }, 50); // 50ms between navigations
        
        // Update count for display
        setCount(index + 1);
      } catch (error) {
        setLogs(prev => [...prev, `Error: ${error.message}`]);
        setIsRunning(false);
      }
    };
    
    // Start the test
    performNavigation(0);
  };
  
  // Stop the test
  const stopTest = () => {
    setIsRunning(false);
    setLogs(prev => [...prev, 'Test stopped by user']);
  };
  
  // Test focused only on home page
  const runHomePageTest = () => {
    setIsRunning(true);
    setLogs([]);
    setCount(0);
    
    // Record start time
    const startTime = performance.now();
    let navigationCount = 0;
    
    // Function to perform a single navigation to home page
    const performHomeNavigation = (index) => {
      if (index >= 50 || !isRunning) {
        // Stop after 50 navigations or if test is stopped
        setIsRunning(false);
        setLogs(prev => [...prev, `Test completed. Performed ${navigationCount} navigations to home page in ${((performance.now() - startTime) / 1000).toFixed(2)}s`]);
        return;
      }
      
      const timestamp = performance.now();
      
      try {
        // Log the navigation attempt
        setLogs(prev => [...prev, `${index + 1}. Navigating to home page at ${(timestamp - startTime).toFixed(2)}ms`]);
        
        // Perform the navigation to home page
        router.push('/');
        navigationCount++;
        
        // Schedule the next navigation after a short delay
        setTimeout(() => {
          performHomeNavigation(index + 1);
        }, 50); // 50ms between navigations
        
        // Update count for display
        setCount(index + 1);
      } catch (error) {
        setLogs(prev => [...prev, `Error: ${error.message}`]);
        setIsRunning(false);
      }
    };
    
    // Start the test
    performHomeNavigation(0);
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Navigation Throttling Test</h1>
      
      <div className="mb-4">
        <button
          onClick={runHomePageTest}
          disabled={isRunning}
          className="px-4 py-2 bg-green-500 text-white rounded mr-2 disabled:opacity-50"
        >
          Test Home Page Only
        </button>
        
        <button
          onClick={runTest}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2 disabled:opacity-50"
        >
          Test Alternating Pages
        </button>
        
        <button
          onClick={stopTest}
          disabled={!isRunning}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Stop Test
        </button>
        
        {isRunning && (
          <span className="ml-4">
            Running... ({count} navigations)
          </span>
        )}
      </div>
      
      <div className="border rounded p-4 bg-gray-50 h-96 overflow-auto">
        <h2 className="text-lg font-semibold mb-2">Logs:</h2>
        <pre className="text-sm">
          {logs.map((log, index) => (
            <div key={index} className={log.includes('Error') ? 'text-red-500' : ''}>
              {log}
            </div>
          ))}
        </pre>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold">About this test:</h3>
        <p>
          This test simulates rapid navigation events to check if Next.js throttling is triggered.
          The warning "Throttling navigation to prevent the browser from hanging" appears in the browser
          console when too many navigation events occur in a short period.
        </p>
        <p className="mt-2">
          The "Test Home Page Only" button will repeatedly navigate to the home page to specifically
          test if your home page is affected by throttling protection.
        </p>
        <p className="mt-2">
          If you see this warning in the console, it indicates that the throttling protection is active.
          You can bypass this protection by adding the <code>--disable-ipc-flooding-protection</code> flag
          when starting Chrome.
        </p>
      </div>
    </div>
  );
}

export default NavigationThrottlingTest; 