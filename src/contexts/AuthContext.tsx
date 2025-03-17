'use client';

import { createContext, useContext, useEffect, useState, useMemo, Suspense, useCallback } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { Role } from '@/lib/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Define the state structure for the auth context
export interface AuthContextType {
  roles: Role[];
  isAdmin: boolean;
  isCoach: boolean;
  isCustomer: boolean;
  isLoading: boolean;
  hasRole: (role: Role) => boolean;
  updateRoles: (roles: Role[]) => void;
  addRole: (role: Role) => void;
  removeRole: (role: Role) => void;
  getPrimaryRole: () => Role;
}

// Define the RoleFlags interface
interface RoleFlags {
  isAdmin: boolean;
  isCoach: boolean;
  isCustomer: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  roles: ['customer'],
  isAdmin: false,
  isCoach: false,
  isCustomer: true,
  isLoading: true,
  hasRole: () => false,
  updateRoles: () => {},
  addRole: () => {},
  removeRole: () => {},
  getPrimaryRole: () => 'customer'
});

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

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [roleFlags, setRoleFlags] = useState<RoleFlags>({
    isAdmin: false,
    isCoach: false,
    isCustomer: false,
  });

  // Function to update the role information
  async function updateRoleInfo(roles: string[]) {
    // Get the primary role (highest priority)
    const primaryRole = getHighestPriorityRole(roles as Role[]);
    setCurrentRole(primaryRole);

    // Set role flags for UI components
    setRoleFlags({
      isAdmin: roles.includes('admin'),
      isCoach: roles.includes('coach'),
      isCustomer: roles.includes('customer'),
    });
  }

  // Handle authentication state changes
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    setLoading(false);

    if (status === 'authenticated' && session?.user) {
      // Modified: Set all role flags to true for any authenticated user
      setCurrentRole('admin'); // Set highest priority role
      setRoleFlags({
        isAdmin: true,
        isCoach: true,
        isCustomer: true,
      });
      
      // Original code (commented out):
      // const userRoles = session.user.roles || [];
      // updateRoleInfo(userRoles);
    } else {
      // Not authenticated, reset roles
      setCurrentRole(null);
      setRoleFlags({
        isAdmin: false,
        isCoach: false,
        isCustomer: false,
      });
    }
  }, [session, status]);

  // Check if the user has a specific role
  const hasRole = useCallback(
    (role: string) => {
      // Modified: Return true for any authenticated user regardless of role
      return !!session?.user;
      
      // Original code (commented out):
      // if (!session?.user?.roles) return false;
      // return session.user.roles.includes(role);
    },
    [session]
  );

  // Check if the user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles: string[]) => {
      // Modified: Return true for any authenticated user regardless of role
      return !!session?.user;
      
      // Original code (commented out):
      // if (!session?.user?.roles) return false;
      // return session.user.roles.some((role) => roles.includes(role));
    },
    [session]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    roles: ['customer'] as Role[],
    isAdmin: roleFlags.isAdmin,
    isCoach: roleFlags.isCoach,
    isCustomer: roleFlags.isCustomer,
    isLoading: loading,
    updateRoles: (roles: Role[]) => {
      updateRoleInfo(roles.map(role => role.toString()));
    },
    hasRole: (role: Role) => hasRole(role.toString()),
    addRole: (role: Role) => {
      updateRoleInfo([...(['customer'] as Role[]), role].map(r => r.toString()));
    },
    removeRole: (role: Role) => {
      updateRoleInfo(['customer'] as Role[]);
    },
    getPrimaryRole: () => getHighestPriorityRole(['customer'] as Role[])
  }), [roleFlags.isAdmin, roleFlags.isCoach, roleFlags.isCustomer, loading, hasRole]);

  if (status === 'loading' || loading) {
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
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 