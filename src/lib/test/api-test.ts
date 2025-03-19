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
      data: { 
        options,
        body: options?.body ? JSON.parse(options.body as string) : undefined 
      }
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
      const responseText = await response.text();
      
      try {
        // Try to parse as JSON
        data = JSON.parse(responseText);
      } catch (e) {
        // If not valid JSON, use the raw text
        data = { rawResponse: responseText };
        error = 'Failed to parse response as JSON';
      }
    } catch (e) {
      error = 'Failed to read response body';
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
  
  // Tests for authentication and basic endpoints
  const endpoints = [
    '/api/admin/users?page=1&limit=10',
    '/api/admin/coaches',
  ];
  
  const results: ApiTestResult[] = [];
  
  // Test GET endpoints
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Get user IDs and coach IDs from initial endpoints
  let validUserId: string | null = null;
  
  // Check if we got a valid response from the users endpoint
  const usersResult = results.find(r => r.endpoint.includes('/api/admin/users'));
  if (usersResult?.success && usersResult.data) {
    try {
      // Try to extract user info from the users list
      const usersData = usersResult.data as any;
      let usersList: any[] = [];
      
      // Handle different response formats
      if (usersData.users && Array.isArray(usersData.users)) {
        usersList = usersData.users;
      } else if (Array.isArray(usersData)) {
        usersList = usersData;
      }
      
      // Look for a user with admin or coach role
      for (const user of usersList) {
        if (user && user._id && Array.isArray(user.roles)) {
          if (user.roles.includes('admin') || user.roles.includes('coach')) {
            validUserId = user._id;
            console.log(`Using user ID for test: ${validUserId} (${user.name || user.email || 'unnamed'})`);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error parsing users data:', error);
    }
  }
  
  // Don't run assign customers test if we don't have a valid user ID
  if (!validUserId) {
    console.warn('Could not find a valid user ID for testing, skipping assign-customers test');
    
    // Count successful and failed tests
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`✅ ${successCount} passing, ❌ ${failCount} failing`);
    
    // Check authentication specifically
    const authStatus = results.some(r => r.status === 401 || r.status === 403) 
      ? '❌ Authentication issues detected' 
      : '✅ Authentication looks good';
    
    console.log(authStatus);
    console.groupEnd();
    
    return results;
  }
  
  // Test POST endpoints with the valid user ID
  console.log(`Testing assign-customers with user ID: ${validUserId}`);
  
  const assignCustomersResult = await testEndpoint('/api/admin/coach/assign-customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coachId: validUserId,
      customerIds: []
    })
  });
  results.push(assignCustomersResult);
  
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
  
  // First verify the users API
  const userApiTest = await testEndpoint('/api/admin/users?page=1&limit=10');
  
  // Test coach endpoints
  const coachesTest = await testEndpoint('/api/admin/coaches');
  
  // Try to validate the coach ID by checking against the users list
  let validCoachId = coachId;
  let validationMessage = '';
  
  if (userApiTest.success && userApiTest.data) {
    try {
      // Try to find the user in the response
      const usersData = userApiTest.data as any;
      let usersList: any[] = [];
      
      // Handle different response formats
      if (usersData.users && Array.isArray(usersData.users)) {
        usersList = usersData.users;
      } else if (Array.isArray(usersData)) {
        usersList = usersData;
      }
      
      // Check if the provided coachId exists in the users list
      const userExists = usersList.some(user => user._id === coachId);
      
      if (userExists) {
        console.log(`✅ Coach ID ${coachId} found in users list`);
        validationMessage = 'Coach ID validated';
      } else {
        // Try to find any coach/admin user to use instead
        const alternateUser = usersList.find(user => 
          user && user._id && Array.isArray(user.roles) &&
          (user.roles.includes('admin') || user.roles.includes('coach'))
        );
        
        if (alternateUser) {
          validCoachId = alternateUser._id;
          console.log(`⚠️ Using alternate coach ID ${validCoachId} (${alternateUser.name || alternateUser.email || 'unnamed'})`);
          validationMessage = 'Using alternate coach ID';
        } else {
          console.log(`❌ Coach ID ${coachId} not found and no alternate available`);
          validationMessage = 'Coach ID not validated';
        }
      }
    } catch (error) {
      console.error('Error validating coach ID:', error);
      validationMessage = 'Error validating coach ID';
    }
  }
  
  // Find coach document
  let coachDocId = validCoachId;
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
        
        if (typeof c.userId === 'string' && c.userId === validCoachId) {
          coachDocId = c._id;
          console.log(`Found coach document ID: ${coachDocId}`);
          break;
        } else if (
          typeof c.userId === 'object' && 
          c.userId !== null && 
          '_id' in c.userId && 
          typeof c.userId._id === 'string' && 
          c.userId._id === validCoachId
        ) {
          coachDocId = c._id;
          console.log(`Found coach document ID: ${coachDocId}`);
          break;
        }
      }
    }
    
    if (coachDocId === validCoachId) {
      console.log('Using direct user ID for coach:', validCoachId);
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
      coachId: validCoachId, // Use validated coach ID
      customerIds: [] // Empty array for testing purposes
    })
  });
  
  debugLog({
    title: 'Coach Assignment Test Results',
    data: {
      originalCoachId: coachId,
      usedCoachId: validCoachId,
      validationMessage,
      coachDocId,
      assignStatus: assignTest.status,
      assignSuccess: assignTest.success,
      assignData: assignTest.data
    }
  });
  
  const results = [userApiTest, coachesTest, customersTest, assignTest];
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