/**
 * API testing utilities for checking API endpoints in the browser
 * This can be used in development to verify API endpoints are working
 */
import { toast } from 'react-hot-toast';
import { debugLog } from '../utils/debugLogger';

export interface ApiTestResult {
  endpoint: string;
  status: number;
  statusText: string;
  success: boolean;
  data?: unknown;
  error?: string;
  responseTime: number;
}

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

export async function testEndpoint(endpoint: string, options?: RequestInit): Promise<ApiTestResult> {
  const startTime = performance.now();
  
  try {
    debugLog({
      title: `Testing Endpoint: ${endpoint}`,
      data: { options }
    });
    
    const response = await fetch(endpoint, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        ...options?.headers,
      },
      ...options
    });
    
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    let data;
    let error;
    
    try {
      data = await response.json();
    } catch {
      error = 'Failed to parse response as JSON';
    }
    
    const result: ApiTestResult = {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      responseTime,
      data,
      error
    };
    
    debugLog({
      title: `Test Result: ${endpoint}`,
      data: result,
      error: !response.ok
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    const result: ApiTestResult = {
      endpoint,
      status: 0,
      statusText: 'Network Error',
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : String(error)
    };
    
    debugLog({
      title: `Test Failed: ${endpoint}`,
      data: result,
      error: true
    });
    
    return result;
  }
}

export async function runApiTests() {
  console.group('🧪 Running API Tests');
  
  // Tests for authentication
  const endpoints = [
    '/api/admin/users?page=1&limit=10',
    '/api/admin/coaches',
    '/api/admin/coach/assign-customers',
  ];
  
  const results: ApiTestResult[] = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Count successful and failed tests
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`✅ ${successCount} passing, ❌ ${failCount} failing`);
  
  // Check authentication specifically
  const authStatus = results.some(r => r.status === 401 || r.status === 403) 
    ? '❌ Authentication issues detected' 
    : '✅ Authentication looks good';
  
  console.log(authStatus);
  
  // Display results in a table
  console.table(results.map(r => ({
    endpoint: r.endpoint,
    status: r.status,
    success: r.success ? '✅' : '❌',
    responseTime: `${r.responseTime}ms`,
  })));
  
  console.groupEnd();
  
  // Show toast with summary
  if (failCount > 0) {
    toast.error(`API Tests: ${failCount} of ${results.length} endpoints failed`);
  } else {
    toast.success(`API Tests: All ${results.length} endpoints passed`);
  }
  
  return results;
}

export async function testAssignCustomersFlow(coachId: string): Promise<FlowTestResults> {
  console.group('🧪 Testing Assign Customers Flow for Coach: ' + coachId);
  
  // Test coach endpoints
  const coachesTest = await testEndpoint('/api/admin/coaches');
  
  // Find coach document
  let coachDocId = coachId;
  if (coachesTest.success && coachesTest.data && Array.isArray(coachesTest.data)) {
    // Find coach document by ID safely
    const coaches = coachesTest.data as unknown[];
    
    for (const coach of coaches) {
      if (
        typeof coach === 'object' && 
        coach !== null && 
        '_id' in coach &&
        'userId' in coach
      ) {
        const c = coach as { _id: string; userId: unknown };
        
        if (typeof c.userId === 'string' && c.userId === coachId) {
          coachDocId = c._id;
          console.log(`Found coach document ID: ${coachDocId}`);
          break;
        } else if (
          typeof c.userId === 'object' && 
          c.userId !== null && 
          '_id' in c.userId && 
          typeof c.userId._id === 'string' && 
          c.userId._id === coachId
        ) {
          coachDocId = c._id;
          console.log(`Found coach document ID: ${coachDocId}`);
          break;
        }
      }
    }
    
    if (coachDocId === coachId) {
      console.warn('Could not find coach document for ID:', coachId);
    }
  }
  
  // Test getting customers for this coach
  const customersTest = await testEndpoint(`/api/admin/coaches/${coachDocId}/customers`);
  
  // Test assign customers endpoint with a mock body
  const assignTest = await testEndpoint('/api/admin/coach/assign-customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coachId,
      customerIds: []
    })
  });
  
  const results = [coachesTest, customersTest, assignTest];
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`✅ ${successCount} passing, ❌ ${failCount} failing`);
  console.groupEnd();
  
  return {
    coachesTest,
    customersTest,
    assignTest,
    summary: {
      success: successCount,
      fail: failCount,
      total: results.length
    }
  };
} 