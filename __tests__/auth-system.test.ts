import { checkRouteAccess, getHomeRedirect, isProtectedRoute } from '@/utils/authNavigation';
import { Role } from '@/lib/types/user';

// Mock session data
const createMockSession = (roles: Role[] = ['customer']) => ({
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    roles: roles
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
});

describe('Authorization System Tests', () => {
  describe('checkRouteAccess', () => {
    it('should allow access to public routes for unauthenticated users', () => {
      const result = checkRouteAccess('/', null);
      expect(result.hasAccess).toBe(true);
      expect(result.redirectTo).toBeNull();
    });

    it('should redirect authenticated users from public routes with redirectAuthenticated', () => {
      const session = createMockSession();
      const result = checkRouteAccess('/', session);
      expect(result.hasAccess).toBe(false);
      expect(result.redirectTo).toBe('/workout');
    });

    it('should redirect unauthenticated users from protected routes', () => {
      const result = checkRouteAccess('/workout', null);
      expect(result.hasAccess).toBe(false);
      expect(result.redirectTo).toBe('/auth/signin');
    });

    it('should allow access to customer routes for customer users', () => {
      const session = createMockSession(['customer']);
      const result = checkRouteAccess('/workout', session);
      expect(result.hasAccess).toBe(true);
      expect(result.redirectTo).toBeNull();
    });

    it('should allow access to coach routes for coach users', () => {
      const session = createMockSession(['coach']);
      const result = checkRouteAccess('/coach', session);
      expect(result.hasAccess).toBe(true);
      expect(result.redirectTo).toBeNull();
    });

    it('should allow access to admin routes for admin users', () => {
      const session = createMockSession(['admin']);
      const result = checkRouteAccess('/admin', session);
      expect(result.hasAccess).toBe(true);
      expect(result.redirectTo).toBeNull();
    });

    it('should deny access to coach routes for customer users', () => {
      const session = createMockSession(['customer']);
      const result = checkRouteAccess('/coach', session);
      expect(result.hasAccess).toBe(false);
      expect(result.redirectTo).toBe('/unauthorized');
    });

    it('should deny access to admin routes for coach users', () => {
      const session = createMockSession(['coach']);
      const result = checkRouteAccess('/admin', session);
      expect(result.hasAccess).toBe(false);
      expect(result.redirectTo).toBe('/unauthorized');
    });

    it('should allow access to all routes for admin users', () => {
      const session = createMockSession(['admin']);
      
      // Admin should have access to admin routes
      expect(checkRouteAccess('/admin', session).hasAccess).toBe(true);
      
      // Admin should have access to coach routes
      expect(checkRouteAccess('/coach', session).hasAccess).toBe(true);
      
      // Admin should have access to customer routes
      expect(checkRouteAccess('/workout', session).hasAccess).toBe(true);
    });

    it('should handle multi-role users correctly', () => {
      const session = createMockSession(['customer', 'coach']);
      
      // Multi-role user should have access to coach routes
      expect(checkRouteAccess('/coach', session).hasAccess).toBe(true);
      
      // Multi-role user should have access to customer routes
      expect(checkRouteAccess('/workout', session).hasAccess).toBe(true);
      
      // Multi-role user should not have access to admin routes
      expect(checkRouteAccess('/admin', session).hasAccess).toBe(false);
    });
  });

  describe('getHomeRedirect', () => {
    it('should redirect to / for unauthenticated users', () => {
      expect(getHomeRedirect(null)).toBe('/');
    });

    it('should redirect to /admin for admin users', () => {
      const session = createMockSession(['admin']);
      expect(getHomeRedirect(session)).toBe('/admin');
    });

    it('should redirect to /coach for coach users', () => {
      const session = createMockSession(['coach']);
      expect(getHomeRedirect(session)).toBe('/coach');
    });

    it('should redirect to /workout for customer users', () => {
      const session = createMockSession(['customer']);
      expect(getHomeRedirect(session)).toBe('/workout');
    });

    it('should prioritize admin role for multi-role users', () => {
      const session = createMockSession(['customer', 'coach', 'admin']);
      expect(getHomeRedirect(session)).toBe('/admin');
    });

    it('should prioritize coach role over customer for multi-role users', () => {
      const session = createMockSession(['customer', 'coach']);
      expect(getHomeRedirect(session)).toBe('/coach');
    });
  });

  describe('isProtectedRoute', () => {
    it('should identify public routes correctly', () => {
      expect(isProtectedRoute('/')).toBe(false);
      expect(isProtectedRoute('/auth/signin')).toBe(false);
      expect(isProtectedRoute('/about')).toBe(false);
    });

    it('should identify protected routes correctly', () => {
      expect(isProtectedRoute('/workout')).toBe(true);
      expect(isProtectedRoute('/coach')).toBe(true);
      expect(isProtectedRoute('/admin')).toBe(true);
    });

    it('should handle nested routes correctly', () => {
      expect(isProtectedRoute('/workout/new')).toBe(true);
      expect(isProtectedRoute('/coach/customers')).toBe(true);
      expect(isProtectedRoute('/admin/users')).toBe(true);
    });
  });
}); 