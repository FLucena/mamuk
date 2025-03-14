import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { isProtectedRoute, getRequiredRoles } from '@/utils/authNavigation';
import middleware from '@/middleware';

// Mock next/server
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  
  return {
    NextResponse: {
      redirect: jest.fn().mockImplementation((url) => ({ url, status: 307 })),
      next: jest.fn().mockReturnValue({ 
        status: 200, 
        headers: new Map([
          ['Content-Type', 'text/html'],
        ]) 
      }),
      json: jest.fn().mockImplementation((body, options) => ({ body, options })),
    },
    NextRequest: originalModule.NextRequest,
  };
});

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  withAuth: jest.fn().mockImplementation((callback) => callback),
}));

// Mock authNavigation utilities
jest.mock('@/utils/authNavigation', () => ({
  isProtectedRoute: jest.fn(),
  getRequiredRoles: jest.fn(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_DOMAIN = 'www.mamuk.com.ar';
process.env.AUTH_DEBUG = 'true';

describe('Middleware', () => {
  let mockRequest: NextRequest;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock URL
    const url = new URL('https://www.mamuk.com.ar/test-path');
    
    // Create a mock request
    mockRequest = new NextRequest(url, {
      headers: new Headers({
        host: 'www.mamuk.com.ar'
      }),
      method: 'GET',
    });
    
    // Default mock for isProtectedRoute and getRequiredRoles
    (isProtectedRoute as jest.Mock).mockReturnValue(false);
    (getRequiredRoles as jest.Mock).mockReturnValue([]);
  });
  
  describe('domain redirect', () => {
    test('should redirect from non-www domain to www domain', async () => {
      // Create a new request with non-www domain
      const url = new URL('https://mamuk.com.ar/test-path');
      const nonWwwRequest = new NextRequest(url, {
        headers: new Headers({
          host: 'mamuk.com.ar'
        }),
      });
      
      await middleware(nonWwwRequest);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('www.mamuk.com.ar'));
    });
    
    test('should not redirect if already on www domain', async () => {
      await middleware(mockRequest);
      
      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });
  });
  
  describe('middleware', () => {
    test('should return 429 when rate limit is exceeded for critical endpoints', async () => {
      // Create a new request for a critical endpoint
      const url = new URL('https://www.mamuk.com.ar/api/auth/login');
      const loginRequest = new NextRequest(url, {
        headers: new Headers({
          host: 'www.mamuk.com.ar'
        }),
        method: 'POST',
      });
      
      // Simulate many requests from the same IP
      for (let i = 0; i < 60; i++) {
        await middleware(loginRequest);
      }
      
      // The next request should be rate limited
      await middleware(loginRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Too many requests') }),
        { status: 429 }
      );
    });
    
    test('should allow access to public routes for unauthenticated users', async () => {
      // Create a new request for a public route
      const url = new URL('https://www.mamuk.com.ar/auth/signin');
      const req = new NextRequest(url, {
        headers: new Headers({
          host: 'www.mamuk.com.ar'
        }),
      });
      
      (isProtectedRoute as jest.Mock).mockReturnValue(false);
      
      const token = null; // Unauthenticated
      
      // Simulate the authorization callback
      const result = await (withAuth as jest.Mock).mock.calls[0][0]({ req, token });
      
      expect(result).toBe(true);
    });
    
    test('should deny access to protected routes for unauthenticated users', async () => {
      // Create a new request for a protected route
      const url = new URL('https://www.mamuk.com.ar/workout');
      const req = new NextRequest(url, {
        headers: new Headers({
          host: 'www.mamuk.com.ar'
        }),
      });
      
      (isProtectedRoute as jest.Mock).mockReturnValue(true);
      
      const token = null; // Unauthenticated
      
      // Simulate the authorization callback
      const result = await (withAuth as jest.Mock).mock.calls[0][0]({ req, token });
      
      expect(result).toBe(false);
    });
    
    test('should allow access to protected routes for users with required roles', async () => {
      // Create a new request for an admin route
      const url = new URL('https://www.mamuk.com.ar/admin');
      const req = new NextRequest(url, {
        headers: new Headers({
          host: 'www.mamuk.com.ar'
        }),
      });
      
      (isProtectedRoute as jest.Mock).mockReturnValue(true);
      (getRequiredRoles as jest.Mock).mockReturnValue(['admin']);
      
      const token = { roles: ['admin'] }; // Admin user
      
      // Simulate the authorization callback
      const result = await (withAuth as jest.Mock).mock.calls[0][0]({ req, token });
      
      expect(result).toBe(true);
    });
    
    test('should deny access to protected routes for users without required roles', async () => {
      // Create a new request for an admin route
      const url = new URL('https://www.mamuk.com.ar/admin');
      const req = new NextRequest(url, {
        headers: new Headers({
          host: 'www.mamuk.com.ar'
        }),
      });
      
      (isProtectedRoute as jest.Mock).mockReturnValue(true);
      (getRequiredRoles as jest.Mock).mockReturnValue(['admin']);
      
      const token = { roles: ['customer'] }; // Customer user
      
      // Simulate the authorization callback
      const result = await (withAuth as jest.Mock).mock.calls[0][0]({ req, token });
      
      expect(result).toBe(false);
    });
    
    test('should assign default customer role if email exists but no roles', async () => {
      // Create a new request for a customer route
      const url = new URL('https://www.mamuk.com.ar/workout');
      const req = new NextRequest(url, {
        headers: new Headers({
          host: 'www.mamuk.com.ar'
        }),
      });
      
      (isProtectedRoute as jest.Mock).mockReturnValue(true);
      (getRequiredRoles as jest.Mock).mockReturnValue(['customer']);
      
      const token = { email: 'test@example.com', roles: undefined }; // User with email but no roles
      
      // Simulate the authorization callback
      const result = await (withAuth as jest.Mock).mock.calls[0][0]({ req, token });
      
      expect(result).toBe(true);
    });
  });
}); 