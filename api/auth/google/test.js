/**
 * Test script for Google authentication verification
 * Run this with Node.js to test the API handler locally
 */
import verify from './verify.js';
import { createMockRequest, createMockResponse } from '../../shared/utils/testing.js';

const testGoogleAuth = async () => {
  console.log('Testing Google authentication API...');
  
  // Create mock request with a test token (this won't be a valid token)
  const req = createMockRequest({
    method: 'POST',
    body: {
      token: 'test_google_token'
    }
  });
  
  // Create mock response
  const res = createMockResponse();
  
  try {
    // Call the handler
    await verify(req, res);
    
    // Get the response data
    const responseData = res.getResponseData();
    
    console.log('Response status:', responseData.statusCode);
    console.log('Response body:', JSON.stringify(responseData.body, null, 2));
    
    // Check for the expected error (since we're using a test token)
    if (responseData.statusCode === 400 || responseData.statusCode === 500) {
      console.log('Expected error response received - this is normal for a test token');
    } else {
      console.log('Unexpected success response - this should not happen with a test token');
    }
  } catch (error) {
    console.error('Error testing Google auth API:', error);
  }
};

// Only run this directly if executed as a script
if (process.argv[1].endsWith('test.js')) {
  testGoogleAuth().catch(console.error);
} 