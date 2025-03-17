'use client';

import { createContext, useContext, useEffect, useState, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Role } from '@/lib/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthState {
  roles: Role[];
  isAdmin: boolean;
  isCoach: boolean;
  isCustomer: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  updateRoles: (roles: Role[]) => void;
  hasRole: (role: Role) => boolean;
  addRole: (role: Role) => void;
  removeRole: (role: Role) => void;
  getPrimaryRole: () => Role;
}

// Helper function to determine the highest priority role
function getHighestPriorityRole(roles: Role[]): Role {
  const priorityOrder: Record<string, number> = {
    'admin': 1,
    'coach': 2,
    'customer': 3
  };
  
  if (!roles || roles.length === 0) return 'customer';
  
  // Sort roles by priority and return the highest priority (lowest number)
  return [...roles].sort((a, b) => 
    (priorityOrder[a] || 999) - (priorityOrder[b] || 999)
  )[0] as Role;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<AuthState>(() => ({
    roles: ['customer'],
    isAdmin: false,
    isCoach: false,
    isCustomer: true,
    isLoading: true
  }));

  // Memoize the roles calculation to avoid unnecessary recalculations
  const calculatedRoles = useMemo(() => {
    if (status === 'loading') return state.roles;
    
    // If not authenticated, return default role
    if (status === 'unauthenticated') return ['customer' as Role];
    
    // Handle the case where roles might not exist on the session user
    const user = session?.user;
    
    // Debug log only if AUTH_DEBUG is enabled
    if (process.env.NODE_ENV === 'development' && process.env.AUTH_DEBUG === 'true' && user) {
      console.log('AuthContext: Session user roles:', {
        roles: user.roles,
        isArray: Array.isArray(user.roles),
        user
      });
    }
    
    // Check if user has roles property and it's an array
    if (user && user.roles) {
      if (Array.isArray(user.roles) && user.roles.length > 0) {
        return user.roles as Role[];
      } else if (typeof user.roles === 'string') {
        // Handle case where roles might be a string
        return [user.roles as Role];
      }
    }
    
    return ['customer' as Role];
  }, [session?.user, status, state.roles]);

  // Update state when roles or session status changes
  useEffect(() => {
    // Do nothing if session is still loading
    if (status === 'loading') return;

    const roles = calculatedRoles;
    const isAdmin = roles.includes('admin');
    const isCoach = isAdmin || roles.includes('coach');
    const isCustomer = roles.includes('customer');

    // Debug log only if AUTH_DEBUG is enabled
    if (process.env.NODE_ENV === 'development' && process.env.AUTH_DEBUG === 'true') {
      console.log('AuthContext: Updating state with roles:', {
        roles,
        isAdmin,
        isCoach,
        isCustomer,
        status
      });
    }

    // Only update if there are actual changes or if we're loading
    setState(prevState => {
      if (
        JSON.stringify(prevState.roles) === JSON.stringify(roles) &&
        prevState.isAdmin === isAdmin &&
        prevState.isCoach === isCoach &&
        prevState.isCustomer === isCustomer &&
        !prevState.isLoading
      ) {
        return prevState; // No change needed
      }
      
      return {
        roles,
        isAdmin,
        isCoach,
        isCustomer,
        isLoading: false
      };
    });
  }, [calculatedRoles, status]); // Remove state from dependencies

  // Function to update the entire roles array
  const updateRoles = useMemo(() => (roles: Role[]) => {
    setState(prev => {
      const isAdmin = roles.includes('admin');
      const isCoach = isAdmin || roles.includes('coach');
      const isCustomer = roles.includes('customer');

      return {
        roles,
        isAdmin,
        isCoach,
        isCustomer,
        isLoading: false
      };
    });
  }, []);

  // Function to check if user has a specific role
  const hasRole = useMemo(() => (role: Role) => {
    return state.roles.includes(role);
  }, [state.roles]);

  // Function to add a role
  const addRole = useMemo(() => (role: Role) => {
    setState(prev => {
      if (prev.roles.includes(role)) return prev;
      
      const newRoles = [...prev.roles, role];
      const isAdmin = newRoles.includes('admin');
      const isCoach = isAdmin || newRoles.includes('coach');
      const isCustomer = newRoles.includes('customer');

      return {
        roles: newRoles,
        isAdmin,
        isCoach,
        isCustomer,
        isLoading: false
      };
    });
  }, []);

  // Function to remove a role
  const removeRole = useMemo(() => (role: Role) => {
    setState(prev => {
      // Don't remove if it's the only role
      if (prev.roles.length <= 1) return prev;
      
      const newRoles = prev.roles.filter(r => r !== role);
      const isAdmin = newRoles.includes('admin');
      const isCoach = isAdmin || newRoles.includes('coach');
      const isCustomer = newRoles.includes('customer');

      return {
        roles: newRoles,
        isAdmin,
        isCoach,
        isCustomer,
        isLoading: false
      };
    });
  }, []);

  // Function to get the primary role (highest priority)
  const getPrimaryRole = useMemo(() => () => {
    return getHighestPriorityRole(state.roles);
  }, [state.roles]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    updateRoles,
    hasRole,
    addRole,
    removeRole,
    getPrimaryRole
  }), [state, updateRoles, hasRole, addRole, removeRole, getPrimaryRole]);

  if (status === 'loading' || state.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthProviderContent>
        {children}
      </AuthProviderContent>
    </Suspense>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 