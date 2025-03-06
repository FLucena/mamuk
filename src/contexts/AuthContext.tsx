'use client';

import { createContext, useContext, useEffect, useState, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Role } from '@/lib/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthState {
  role: Role;
  isAdmin: boolean;
  isCoach: boolean;
  isCustomer: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  updateRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<AuthState>(() => ({
    role: 'customer',
    isAdmin: false,
    isCoach: false,
    isCustomer: true,
    isLoading: true
  }));

  // Memoize the role calculation to avoid unnecessary recalculations
  const calculatedRole = useMemo(() => {
    if (status === 'loading') return state.role;
    return session?.user?.role || 'customer';
  }, [session?.user?.role, status, state.role]);

  // Actualizar el estado solo cuando cambia el rol o el estado de la sesión
  useEffect(() => {
    // No hacer nada si la sesión aún está cargando
    if (status === 'loading') return;

    const role = calculatedRole;
    const isAdmin = role === 'admin';
    const isCoach = isAdmin || role === 'coach';
    const isCustomer = !isAdmin && !isCoach;

    // Solo actualizar si hay cambios reales o si estamos cargando
    if (
      state.role === role &&
      state.isAdmin === isAdmin &&
      state.isCoach === isCoach &&
      state.isCustomer === isCustomer &&
      !state.isLoading
    ) {
      return;
    }

    setState({
      role,
      isAdmin,
      isCoach,
      isCustomer,
      isLoading: false
    });
  }, [calculatedRole, status, state]);

  // Memoize the updateRole function to prevent unnecessary re-renders
  const updateRole = useMemo(() => (role: Role) => {
    setState(prev => {
      const isAdmin = role === 'admin';
      const isCoach = isAdmin || role === 'coach';
      const isCustomer = !isAdmin && !isCoach;

      // Only update if there are actual changes
      if (
        prev.role === role &&
        prev.isAdmin === isAdmin &&
        prev.isCoach === isCoach &&
        prev.isCustomer === isCustomer &&
        !prev.isLoading
      ) {
        return prev;
      }

      return {
        role,
        isAdmin,
        isCoach,
        isCustomer,
        isLoading: false
      };
    });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    updateRole
  }), [state, updateRole]);

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