import { Session } from 'next-auth';
import { Role } from '@/lib/types/user';
import { checkRouteAccess, getHomeRedirect } from '@/utils/authNavigation';

/**
 * Create a mock session for testing
 */
export function createMockSession(roles: Role[] = ['customer']): Session {
  return {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      roles: roles,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
  };
}

/**
 * Test all routes for a specific user role
 */
export function testRouteAccessForRole(role: Role): { 
  accessibleRoutes: string[]; 
  inaccessibleRoutes: string[]; 
  redirects: Record<string, string>;
} {
  const session = createMockSession([role]);
  const accessibleRoutes: string[] = [];
  const inaccessibleRoutes: string[] = [];
  const redirects: Record<string, string> = {};
  
  // Test all routes defined in the application
  const routesToTest = [
    '/',
    '/auth/signin',
    '/auth/error',
    '/about',
    '/features',
    '/pricing',
    '/blog',
    '/contact',
    '/terms',
    '/privacy',
    '/guides',
    '/help-center',
    '/support',
    '/offline',
    '/unauthorized',
    '/workout',
    '/achievements',
    '/profile',
    '/coach',
    '/admin',
    '/coach/customers',
    '/admin/users',
  ];
  
  routesToTest.forEach(route => {
    const { hasAccess, redirectTo } = checkRouteAccess(route, session);
    
    if (hasAccess) {
      accessibleRoutes.push(route);
    } else {
      inaccessibleRoutes.push(route);
      if (redirectTo) {
        redirects[route] = redirectTo;
      }
    }
  });
  
  return { accessibleRoutes, inaccessibleRoutes, redirects };
}

/**
 * Test all routes for an unauthenticated user
 */
export function testRouteAccessForUnauthenticated(): { 
  accessibleRoutes: string[]; 
  inaccessibleRoutes: string[]; 
  redirects: Record<string, string>;
} {
  const session = null;
  const accessibleRoutes: string[] = [];
  const inaccessibleRoutes: string[] = [];
  const redirects: Record<string, string> = {};
  
  // Test all routes defined in the application
  const routesToTest = [
    '/',
    '/auth/signin',
    '/auth/error',
    '/about',
    '/features',
    '/pricing',
    '/blog',
    '/contact',
    '/terms',
    '/privacy',
    '/guides',
    '/help-center',
    '/support',
    '/offline',
    '/unauthorized',
    '/workout',
    '/achievements',
    '/profile',
    '/coach',
    '/admin',
    '/coach/customers',
    '/admin/users',
  ];
  
  routesToTest.forEach(route => {
    const { hasAccess, redirectTo } = checkRouteAccess(route, session);
    
    if (hasAccess) {
      accessibleRoutes.push(route);
    } else {
      inaccessibleRoutes.push(route);
      if (redirectTo) {
        redirects[route] = redirectTo;
      }
    }
  });
  
  return { accessibleRoutes, inaccessibleRoutes, redirects };
}

/**
 * Run all auth navigation tests and return results
 */
export function runAllAuthNavigationTests() {
  const customerResults = testRouteAccessForRole('customer');
  const coachResults = testRouteAccessForRole('coach');
  const adminResults = testRouteAccessForRole('admin');
  const unauthenticatedResults = testRouteAccessForUnauthenticated();
  
  return {
    customer: customerResults,
    coach: coachResults,
    admin: adminResults,
    unauthenticated: unauthenticatedResults,
  };
}

/**
 * Test home redirects for different user roles
 */
export function testHomeRedirects() {
  const customerSession = createMockSession(['customer']);
  const coachSession = createMockSession(['coach']);
  const adminSession = createMockSession(['admin']);
  const multiRoleSession = createMockSession(['customer', 'coach']);
  
  return {
    customer: getHomeRedirect(customerSession),
    coach: getHomeRedirect(coachSession),
    admin: getHomeRedirect(adminSession),
    multiRole: getHomeRedirect(multiRoleSession),
    unauthenticated: getHomeRedirect(null),
  };
} 