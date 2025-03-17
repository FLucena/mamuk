'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/types/user';
import { redirectService } from '@/utils/redirectService';

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
  const initialCheckDone = useRef<boolean>(false);
  
  useEffect(() => {
    // Wait until the session is loaded
    if (status === 'loading') return;
    
    // Handle unauthenticated users
    if (!session && !redirectIfAuthenticated) {
      redirectService.performRedirect(router, redirectTo, { 
        source: 'useAuthRedirect-unauthenticated',
        // Force the first redirect
        force: !initialCheckDone.current,
        // Pass the session status
        sessionStatus: status
      });
      initialCheckDone.current = true;
      return;
    }
    
    // Handle authenticated users that should be redirected
    if (session && redirectIfAuthenticated) {
      redirectService.performRedirect(router, redirectTo, { 
        source: 'useAuthRedirect-authenticated',
        // Force the first redirect
        force: !initialCheckDone.current,
        // Pass the session status
        sessionStatus: status
      });
      initialCheckDone.current = true;
      return;
    }
    
    // DISABLED: Handle role-based access
    // Now any authenticated user has access to any page
    /*
    if (session && requiredRoles.length > 0) {
      const userRoles = session.user.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        redirectService.performRedirect(router, '/unauthorized', { 
          source: 'useAuthRedirect-unauthorized',
          // Force the first redirect
          force: !initialCheckDone.current,
          // Pass the session status
          sessionStatus: status
        });
        initialCheckDone.current = true;
        return;
      }
    }
    */
    
    // Mark that we've done the initial check
    initialCheckDone.current = true;
  }, [session, status, router, redirectTo, redirectIfAuthenticated, requiredRoles]);
  
  return { session, isLoading: status === 'loading' };
} 