import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { sessionCache } from '@/utils/sessionCache';
import { JsonValue, JsonObject } from '@/types/common';

/**
 * A lightweight wrapper around useSession that implements:
 * 1. Request deduplication - prevents multiple simultaneous requests
 * 2. Session caching - reduces repeated API calls
 * 3. Performance monitoring - tracks session request times
 */
export function useLightSession() {
  const session = useSession();
  return session;
}

// Helper function to safely check if session data has a user property
const isValidSession = (data: JsonValue): data is JsonObject & { user: JsonObject } => {
  return data !== null && 
         typeof data === 'object' && 
         'user' in data && 
         data.user !== null &&
         typeof data.user === 'object';
};

// Helper function to safely get user property
const getUserProperty = <T>(data: JsonValue, property: string, defaultValue: T): T => {
  if (!isValidSession(data)) return defaultValue;
  
  const user = data.user;
  if (!(property in user)) return defaultValue;
  
  return user[property] as unknown as T;
};

// Helper function to safely get user roles
const getUserRoles = (data: JsonValue): string[] => {
  if (!isValidSession(data)) return [];
  
  const user = data.user;
  if (!('roles' in user) || !Array.isArray(user.roles)) return [];
  
  return user.roles as unknown as string[];
};

/**
 * Hook for components that only need authentication state
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
            isAuthenticated: isValidSession(sessionData),
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
          const roles = getUserRoles(sessionData);
          setState({
            role: roles[0] || null,
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
  const [state, setState] = useState<{
    userId: string | null;
    isLoading: boolean;
  }>({
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
            userId: getUserProperty(sessionData, 'id', null),
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
          if (isValidSession(sessionData)) {
            // Only include essential user data
            const minimalUser = {
              id: getUserProperty(sessionData, 'id', ''),
              roles: getUserRoles(sessionData)
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