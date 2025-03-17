import { Session } from 'next-auth';

// Define basic route access requirements
export interface RouteAccess {
  path: string;
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
  { path: '/workout', redirectUnauthenticated: '/auth/signin' },
  { path: '/workout/new', redirectUnauthenticated: '/auth/signin' },
  { path: '/workout/archived', redirectUnauthenticated: '/auth/signin' },
  { path: '/achievements', redirectUnauthenticated: '/auth/signin' },
  { path: '/profile', redirectUnauthenticated: '/auth/signin' },
  { path: '/coach', redirectUnauthenticated: '/auth/signin' },
  { path: '/coach/customers', redirectUnauthenticated: '/auth/signin' },
  { path: '/coach/customers/workouts', redirectUnauthenticated: '/auth/signin' },
  { path: '/admin', redirectUnauthenticated: '/auth/signin' },
  { path: '/admin/users', redirectUnauthenticated: '/auth/signin' },
  { path: '/admin/coaches', redirectUnauthenticated: '/auth/signin' },
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
  
  // Allow any authenticated user to access any page
  return {
    hasAccess: true,
    redirectTo: null,
    reason: 'User is authenticated'
  };
}

/**
 * Get the appropriate redirect for a user
 * @param session The user's session
 * @returns The path to redirect to
 */
export function getHomeRedirect(session: Session | null): string {
  if (!session?.user) {
    return '/';
  }
  
  // Always redirect authenticated users to /workout
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