import { Role } from '@/lib/types/user';
import { Session } from 'next-auth';

// Define route access requirements
export interface RouteAccess {
  path: string;
  requiredRoles?: Role[];
  isPublic?: boolean;
  redirectUnauthenticated?: string;
  redirectAuthenticated?: string;
}

// Define all application routes with their access requirements
export const ROUTE_ACCESS: RouteAccess[] = [
  // Public routes
  { path: '/', isPublic: true, redirectAuthenticated: '/workout' },
  { path: '/auth/signin', isPublic: true, redirectAuthenticated: '/workout' },
  { path: '/auth/error', isPublic: true },
  { path: '/about', isPublic: true },
  { path: '/features', isPublic: true },
  { path: '/pricing', isPublic: true },
  { path: '/blog', isPublic: true },
  { path: '/contact', isPublic: true },
  { path: '/terms', isPublic: true },
  { path: '/privacy', isPublic: true },
  { path: '/guides', isPublic: true },
  { path: '/help-center', isPublic: true },
  { path: '/support', isPublic: true },
  { path: '/offline', isPublic: true },
  { path: '/unauthorized', isPublic: true },
  
  // Authenticated routes
  { path: '/workout', requiredRoles: ['customer', 'coach', 'admin'], redirectUnauthenticated: '/auth/signin' },
  { path: '/achievements', requiredRoles: ['customer', 'coach', 'admin'], redirectUnauthenticated: '/auth/signin' },
  { path: '/profile', requiredRoles: ['customer', 'coach', 'admin'], redirectUnauthenticated: '/auth/signin' },
  
  // Coach routes
  { path: '/coach', requiredRoles: ['coach', 'admin'], redirectUnauthenticated: '/auth/signin' },
  
  // Admin routes
  { path: '/admin', requiredRoles: ['admin'], redirectUnauthenticated: '/unauthorized' },
];

/**
 * Check if a user has access to a specific route
 * @param path The route path to check
 * @param session The user's session
 * @returns An object with access information
 */
export function checkRouteAccess(path: string, session: Session | null): {
  hasAccess: boolean;
  redirectTo: string | null;
  reason: string;
} {
  // Find the route configuration
  const route = ROUTE_ACCESS.find(r => {
    // Exact match
    if (r.path === path) return true;
    
    // Check if path starts with route path (for nested routes)
    if (path.startsWith(`${r.path}/`)) return true;
    
    return false;
  });
  
  // If no route configuration is found, default to requiring authentication
  if (!route) {
    return {
      hasAccess: !!session,
      redirectTo: session ? null : '/auth/signin',
      reason: 'Route not configured, defaulting to requiring authentication'
    };
  }
  
  // Public routes are accessible to everyone
  if (route.isPublic) {
    // If authenticated and route has redirectAuthenticated, redirect
    if (session && route.redirectAuthenticated) {
      return {
        hasAccess: false,
        redirectTo: route.redirectAuthenticated,
        reason: 'User is authenticated but route is public with redirect'
      };
    }
    
    return {
      hasAccess: true,
      redirectTo: null,
      reason: 'Route is public'
    };
  }
  
  // If not authenticated, redirect to signin
  if (!session) {
    return {
      hasAccess: false,
      redirectTo: route.redirectUnauthenticated || '/auth/signin',
      reason: 'User is not authenticated'
    };
  }
  
  // If route requires specific roles, check if user has any of them
  if (route.requiredRoles && route.requiredRoles.length > 0) {
    const userRoles = session.user?.roles || [];
    const hasRequiredRole = route.requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return {
        hasAccess: false,
        redirectTo: '/unauthorized',
        reason: `User lacks required role(s): ${route.requiredRoles.join(', ')}`
      };
    }
  }
  
  // User has access
  return {
    hasAccess: true,
    redirectTo: null,
    reason: 'User has access'
  };
}

/**
 * Get the appropriate redirect for a user based on their roles
 * @param session The user's session
 * @returns The path to redirect to
 */
export function getHomeRedirect(session: Session | null): string {
  if (!session) {
    return '/';
  }
  
  const userRoles = session.user?.roles || [];
  
  if (userRoles.includes('admin')) {
    return '/admin';
  }
  
  if (userRoles.includes('coach')) {
    return '/coach';
  }
  
  return '/workout';
}

/**
 * Check if a path is a protected route
 * @param path The route path to check
 * @returns Whether the route is protected
 */
export function isProtectedRoute(path: string): boolean {
  const route = ROUTE_ACCESS.find(r => {
    if (r.path === path) return true;
    if (path.startsWith(`${r.path}/`)) return true;
    return false;
  });
  
  return route ? !route.isPublic : true; // Default to protected if not found
}

/**
 * Get required roles for a route
 * @param path The route path to check
 * @returns Array of required roles or null if public
 */
export function getRequiredRoles(path: string): Role[] | null {
  const route = ROUTE_ACCESS.find(r => {
    if (r.path === path) return true;
    if (path.startsWith(`${r.path}/`)) return true;
    return false;
  });
  
  if (!route) return ['customer', 'coach', 'admin']; // Default to requiring any authenticated role
  if (route.isPublic) return null;
  return route.requiredRoles || ['customer', 'coach', 'admin'];
} 