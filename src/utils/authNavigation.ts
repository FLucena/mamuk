import { Session } from 'next-auth';

// Define basic route access requirements
export interface RouteAccess {
  path: string;
  isPublic?: boolean;
}

// Define all application routes with their access requirements
// All routes are now set to public to disable any route protection
export const ROUTE_ACCESS: RouteAccess[] = [
  // All routes are public by default
  { path: '/', isPublic: true },
  { path: '/auth/signin', isPublic: true },
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
  { path: '/workout', isPublic: true },
  { path: '/workout/new', isPublic: true },
  { path: '/workout/archived', isPublic: true },
  { path: '/achievements', isPublic: true },
  { path: '/profile', isPublic: true },
  { path: '/coach', isPublic: true },
  { path: '/coach/customers', isPublic: true },
  { path: '/coach/customers/workouts', isPublic: true },
  { path: '/admin', isPublic: true },
  { path: '/admin/users', isPublic: true },
  { path: '/admin/coaches', isPublic: true },
];

/**
 * Simplified function that always allows access
 * @param path The route path to check
 * @param session The user's session
 * @returns An object with access information
 */
export function checkRouteAccess(path: string, session: Session | null): {
  hasAccess: boolean;
  redirectTo: string | null;
  reason: string;
} {
  // Always grant access in the simplified version
  return {
    hasAccess: true,
    redirectTo: null,
    reason: 'Route protection disabled - all routes are public'
  };
}

/**
 * Get the appropriate redirect for a user
 * @param session The user's session
 * @returns The path to redirect to
 */
export function getHomeRedirect(session: Session | null): string {
  // Always return home page in simplified version
  return '/';
}

/**
 * Simplified function that always returns false
 * @param path The route path to check
 * @returns Always false - no routes are protected
 */
export function isProtectedRoute(path: string): boolean {
  return false; // No routes are protected in simplified version
} 