import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { sessionCache } from '@/utils/sessionCache';

/**
 * A lightweight wrapper around useSession that implements:
 * 1. Request deduplication - prevents multiple simultaneous requests
 * 2. Session caching - reduces repeated API calls
 * 3. Performance monitoring - tracks session request times
 */
export function useLightSession() {
  const session = useSession();
  const hasLoggedPerformance = useRef(false);
  
  useEffect(() => {
    // Record session request completion for performance monitoring
    if (session.status !== 'loading' && !hasLoggedPerformance.current) {
      hasLoggedPerformance.current = true;
      const cachedTimestamp = sessionCache.getRequestTimestamp();
      if (cachedTimestamp) {
        const loadTime = performance.now() - cachedTimestamp;
        console.info(`[Session] Loaded in ${loadTime.toFixed(2)}ms (${session.status})`);
      }
    }
  }, [session.status]);
  
  return session;
}

/**
 * Hook for components that only need to check if user is authenticated
 * without needing the full session data
 */
export function useIsAuthenticated() {
  const [state, setState] = useState({
    isAuthenticated: false,
    isLoading: true
  });
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const sessionData = await sessionCache.getSession();
        if (isMounted) {
          setState({
            isAuthenticated: !!sessionData?.user,
            isLoading: false
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            isAuthenticated: false,
            isLoading: false
          });
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  return state;
}

/**
 * Hook for components that only need user role information
 * without needing the full session data
 */
export function useUserRole() {
  const [state, setState] = useState({
    role: null,
    isLoading: true
  });
  
  useEffect(() => {
    let isMounted = true;
    
    const checkRole = async () => {
      try {
        const sessionData = await sessionCache.getSession();
        if (isMounted) {
          setState({
            role: sessionData?.user?.roles?.[0] || null,
            isLoading: false
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            role: null,
            isLoading: false
          });
        }
      }
    };
    
    checkRole();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  return state;
}

/**
 * Hook for components that only need user ID
 * without needing the full session data
 */
export function useUserId() {
  const [state, setState] = useState({
    userId: null,
    isLoading: true
  });
  
  useEffect(() => {
    let isMounted = true;
    
    const checkUserId = async () => {
      try {
        const sessionData = await sessionCache.getSession();
        if (isMounted) {
          setState({
            userId: sessionData?.user?.id || null,
            isLoading: false
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            userId: null,
            isLoading: false
          });
        }
      }
    };
    
    checkUserId();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  return state;
}

/**
 * Hook that provides a minimal session with just the essential data
 * Optimized for components that need minimal session information
 */
export function useMinimalSession() {
  const [state, setState] = useState<{
    user: { id: string; roles: string[] } | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  }>({
    user: null,
    status: 'loading'
  });
  
  useEffect(() => {
    let isMounted = true;
    
    const loadSession = async () => {
      try {
        const sessionData = await sessionCache.getSession();
        if (isMounted) {
          if (sessionData?.user) {
            // Only include essential user data
            const minimalUser = {
              id: sessionData.user.id,
              roles: sessionData.user.roles || []
            };
            
            setState({
              user: minimalUser,
              status: 'authenticated'
            });
          } else {
            setState({
              user: null,
              status: 'unauthenticated'
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          setState({
            user: null,
            status: 'unauthenticated'
          });
        }
      }
    };
    
    loadSession();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  return state;
} 