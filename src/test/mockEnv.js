/**
 * Mock environment variables for tests
 */

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api'; 