import { 
  checkRouteAccess, 
  getHomeRedirect, 
  isProtectedRoute
} from '@/utils/authNavigation';
import { createMockSession } from '@/test/authNavigationTest';

describe('Auth Navigation Utilities', () => {
  describe('checkRouteAccess', () => {
    test('should allow access to public routes for unauthenticated users', () => {
      const publicRoutes = ['/', '/about', '/auth/signin', '/terms', '/privacy'];
      
      publicRoutes.forEach(route => {
        const { hasAccess } = checkRouteAccess(route, null);
        expect(hasAccess).toBe(true);
      });
    });
    
    test('should redirect authenticated users from public routes with redirectAuthenticated', () => {
      const customerSession = createMockSession(['customer']);
      const { hasAccess, redirectTo } = checkRouteAccess('/', customerSession);
      
      expect(hasAccess).toBe(false);
      expect(redirectTo).toBe('/workout');
    });
    
    test('should deny access to protected routes for unauthenticated users', () => {
      const protectedRoutes = ['/workout', '/achievements', '/profile', '/coach', '/admin'];
      
      protectedRoutes.forEach(route => {
        const { hasAccess, redirectTo } = checkRouteAccess(route, null);
        expect(hasAccess).toBe(false);
        expect(redirectTo).toBeTruthy();
      });
    });
    
    test('should allow customer access to customer routes', () => {
      const customerSession = createMockSession(['customer']);
      const customerRoutes = ['/workout', '/achievements', '/profile'];
      
      customerRoutes.forEach(route => {
        const { hasAccess } = checkRouteAccess(route, customerSession);
        expect(hasAccess).toBe(true);
      });
    });
    
    test('should deny customer access to coach and admin routes', () => {
      const customerSession = createMockSession(['customer']);
      const restrictedRoutes = ['/coach', '/admin'];
      
      restrictedRoutes.forEach(route => {
        const { hasAccess, redirectTo } = checkRouteAccess(route, customerSession);
        expect(hasAccess).toBe(false);
        expect(redirectTo).toBe('/unauthorized');
      });
    });
    
    test('should allow coach access to coach and customer routes', () => {
      const coachSession = createMockSession(['coach']);
      const accessibleRoutes = ['/workout', '/achievements', '/profile', '/coach'];
      
      accessibleRoutes.forEach(route => {
        const { hasAccess } = checkRouteAccess(route, coachSession);
        expect(hasAccess).toBe(true);
      });
    });
    
    test('should deny coach access to admin routes', () => {
      const coachSession = createMockSession(['coach']);
      const { hasAccess, redirectTo } = checkRouteAccess('/admin', coachSession);
      
      expect(hasAccess).toBe(false);
      expect(redirectTo).toBe('/unauthorized');
    });
    
    test('should allow admin access to all routes', () => {
      const adminSession = createMockSession(['admin']);
      const allProtectedRoutes = ['/workout', '/achievements', '/profile', '/coach', '/admin'];
      
      allProtectedRoutes.forEach(route => {
        const { hasAccess } = checkRouteAccess(route, adminSession);
        expect(hasAccess).toBe(true);
      });
    });
  });
  
  describe('getHomeRedirect', () => {
    test('should redirect unauthenticated users to home page', () => {
      expect(getHomeRedirect(null)).toBe('/');
    });
    
    test('should redirect customers to workout page', () => {
      const customerSession = createMockSession(['customer']);
      expect(getHomeRedirect(customerSession)).toBe('/workout');
    });
    
    test('should redirect coaches to coach page', () => {
      const coachSession = createMockSession(['coach']);
      expect(getHomeRedirect(coachSession)).toBe('/coach');
    });
    
    test('should redirect admins to admin page', () => {
      const adminSession = createMockSession(['admin']);
      expect(getHomeRedirect(adminSession)).toBe('/admin');
    });
    
    test('should prioritize admin role for users with multiple roles', () => {
      const multiRoleSession = createMockSession(['customer', 'coach', 'admin']);
      expect(getHomeRedirect(multiRoleSession)).toBe('/admin');
    });
    
    test('should prioritize coach role over customer role', () => {
      const multiRoleSession = createMockSession(['customer', 'coach']);
      expect(getHomeRedirect(multiRoleSession)).toBe('/coach');
    });
  });
  
  describe('isProtectedRoute', () => {
    test('should identify public routes correctly', () => {
      const publicRoutes = ['/', '/about', '/auth/signin', '/terms', '/privacy'];
      
      publicRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(false);
      });
    });
    
    test('should identify protected routes correctly', () => {
      const protectedRoutes = ['/workout', '/achievements', '/profile', '/coach', '/admin'];
      
      protectedRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(true);
      });
    });
    
    test('should handle nested routes correctly', () => {
      expect(isProtectedRoute('/coach/customers')).toBe(true);
      expect(isProtectedRoute('/admin/users')).toBe(true);
      expect(isProtectedRoute('/blog/post-1')).toBe(false);
    });
  });
}); 