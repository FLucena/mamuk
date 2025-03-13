'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/types/user';

/**
 * Hook to handle authentication redirects consistently across the application
 * @param options Configuration options
 * @returns Session data and loading state
 */
export function useAuthRedirect(options: {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
  requiredRoles?: Role[];
} = {}) {
  const { redirectTo = '/auth/signin', redirectIfAuthenticated = false, requiredRoles = [] } = options;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // Wait until the session is loaded
    if (status === 'loading') return;
    
    // Handle unauthenticated users
    if (!session && !redirectIfAuthenticated) {
      router.push(redirectTo);
      return;
    }
    
    // Handle authenticated users that should be redirected
    if (session && redirectIfAuthenticated) {
      router.push(redirectTo);
      return;
    }
    
    // Handle role-based access
    if (session && requiredRoles.length > 0) {
      const userRoles = session.user.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [session, status, router, redirectTo, redirectIfAuthenticated, requiredRoles]);
  
  return { session, isLoading: status === 'loading' };
} 