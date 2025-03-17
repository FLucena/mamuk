import { Role } from '@/lib/types/user';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

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
  { path: '/workout/new', requiredRoles: ['customer', 'coach', 'admin'], redirectUnauthenticated: '/auth/signin' },
  { path: '/workout/archived', requiredRoles: ['customer', 'coach', 'admin'], redirectUnauthenticated: '/auth/signin' },
  { path: '/achievements', requiredRoles: ['customer', 'coach', 'admin'], redirectUnauthenticated: '/auth/signin' },
  { path: '/profile', requiredRoles: ['customer', 'coach', 'admin'], redirectUnauthenticated: '/auth/signin' },
  
  // Coach routes
  { path: '/coach', requiredRoles: ['coach', 'admin'], redirectUnauthenticated: '/unauthorized' },
  { path: '/coach/customers', requiredRoles: ['coach', 'admin'], redirectUnauthenticated: '/unauthorized' },
  { path: '/coach/customers/workouts', requiredRoles: ['coach', 'admin'], redirectUnauthenticated: '/unauthorized' },
  
  // Admin routes
  { path: '/admin', requiredRoles: ['admin'], redirectUnauthenticated: '/unauthorized' },
  { path: '/admin/users', requiredRoles: ['admin'], redirectUnauthenticated: '/unauthorized' },
  { path: '/admin/coaches', requiredRoles: ['admin'], redirectUnauthenticated: '/unauthorized' },
];

// Add a redirect history tracker to prevent redirect loops and multiple redirects
const redirectHistory: string[] = [];
const MAX_REDIRECT_HISTORY = 5;

/**
 * Tracks redirects to prevent loops and multiple consecutive redirects
 * @param from Source path
 * @param to Destination path
 * @returns Whether the redirect should proceed
 */
export function trackRedirect(from: string, to: string): boolean {
  // Don't redirect to the same page
  if (from === to) return false;
  
  // Add to history
  redirectHistory.push(`${from} -> ${to}`);
  
  // Trim history if it gets too long
  if (redirectHistory.length > MAX_REDIRECT_HISTORY) {
    redirectHistory.shift();
  }
  
  // Check for redirect loops
  const lastRedirects = redirectHistory.slice(-3);
  if (lastRedirects.length >= 3) {
    // Check if we're in a loop (A->B->A->B pattern)
    const pattern = `${from} -> ${to}`;
    const occurrences = lastRedirects.filter(r => r === pattern).length;
    
    if (occurrences >= 2) {
      console.warn('Redirect loop detected:', lastRedirects);
      return false;
    }
  }
  
  // Check if we've had too many redirects in a short time
  if (redirectHistory.length >= 3) {
    const timeWindow = 2000; // 2 seconds
    const now = Date.now();
    
    // If we've had 3+ redirects in the last 2 seconds, prevent further redirects
    if (redirectHistory.length >= 3 && (now - (redirectHistory as any).lastRedirectTime < timeWindow)) {
      console.warn('Too many redirects in a short time:', redirectHistory);
      return false;
    }
    
    (redirectHistory as any).lastRedirectTime = now;
  }
  
  return true;
}

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
  
  // MODIFIED: Allow any authenticated user to access any page regardless of role
  // This bypasses the role check completely
  return {
    hasAccess: true,
    redirectTo: null,
    reason: 'User is authenticated (all authenticated users have full access)'
  };

  /* ORIGINAL ROLE CHECK - REMOVED
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
  */
}

/**
 * Get the appropriate redirect for a user based on their roles
 * @param session The user's session
 * @returns The path to redirect to
 */
export function getHomeRedirect(session: Session | null): string {
  if (!session?.user?.roles) {
    return '/';
  }
  
  const userRoles = session.user.roles;
  
  // Check roles in order of priority
  if (userRoles.includes('admin')) {
    return '/admin';
  }
  
  if (userRoles.includes('coach')) {
    return '/coach';  // Redirect coaches to coach dashboard
  }
  
  if (userRoles.includes('customer')) {
    return '/workout';  // Redirect customers to workout page
  }
  
  return '/';  // Fallback to home page
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
 * Get the required roles for a given path
 * @param path The path to check
 * @returns Array of required roles or null if no roles are required
 */
export function getRequiredRoles(path: string): Role[] | null {
  // Check if the path matches any of our defined routes
  const route = ROUTE_ACCESS.find(r => {
    // Direct match
    if (r.path === path) return true;
    
    // Check for dynamic segments
    if (r.path.includes('[') && r.path.includes(']')) {
      const routePattern = r.path.replace(/\[([^\]]+)\]/g, '([^/]+)');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(path);
    }
    
    return false;
  });
  
  // If no matching route was found, return null (public)
  if (!route) return null;
  
  // If the route is marked as public, return null (no roles required)
  if (route.isPublic) return null;
  
  // For all other routes (non-public), also return null
  // This means no specific roles are required - any authenticated user can access
  return null;
  
  // Original implementation - commented out
  // Return the required roles for the route, or a default list
  // return route.requiredRoles || ['customer', 'coach', 'admin'];
}

/**
 * Creates a properly typed session object from a JWT token
 * @param token The JWT token
 * @returns A session object or null
 */
export function createSessionFromToken(token: JWT | null): Session | null {
  if (!token) return null;
  
  // Ensure roles is an array of Role type
  let roles: Role[] = ['customer'];
  
  if (token.roles) {
    if (Array.isArray(token.roles) && token.roles.length > 0) {
      // Validate that each role is a valid Role type
      roles = token.roles.filter(role => 
        role === 'admin' || role === 'coach' || role === 'customer'
      ) as Role[];
      
      // If no valid roles, default to customer
      if (roles.length === 0) {
        roles = ['customer'];
      }
    } else if (typeof token.roles === 'string') {
      // Handle case where roles might be a string
      const role = token.roles as string;
      if (role === 'admin' || role === 'coach' || role === 'customer') {
        roles = [role as Role];
      }
    }
  }
  
  return {
    user: {
      id: token.id || '',
      roles,
      email: token.email,
      name: token.name
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  };
} 