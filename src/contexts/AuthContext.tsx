'use client';

import { createContext, useContext, useEffect, useState, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Role } from '@/lib/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthState {
  role: Role; // Rol principal (para compatibilidad)
  roles: Role[]; // Array de roles
  isAdmin: boolean;
  isCoach: boolean;
  isCustomer: boolean;
  hasRole: (role: Role) => boolean; // Nueva función para verificar si tiene un rol específico
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  updateRole: (role: Role) => void;
  updateRoles: (roles: Role[]) => void; // Nueva función para actualizar todos los roles
  addRole: (role: Role) => void; // Nueva función para añadir un rol
  removeRole: (role: Role) => void; // Nueva función para eliminar un rol
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<AuthState>(() => ({
    role: 'customer',
    roles: ['customer'],
    isAdmin: false,
    isCoach: false,
    isCustomer: true,
    hasRole: (role: Role) => role === 'customer',
    isLoading: true
  }));

  // Memoize the role calculation to avoid unnecessary recalculations
  const calculatedRole = useMemo(() => {
    if (status === 'loading') return state.role;
    return session?.user?.role || 'customer';
  }, [session?.user?.role, status, state.role]);

  // Memoize the roles calculation
  const calculatedRoles = useMemo(() => {
    if (status === 'loading') return state.roles;
    return session?.user?.roles || [calculatedRole];
  }, [session?.user?.roles, calculatedRole, status, state.roles]);

  // Actualizar el estado solo cuando cambia el rol o el estado de la sesión
  useEffect(() => {
    // No hacer nada si la sesión aún está cargando
    if (status === 'loading') return;

    const role = calculatedRole;
    const roles = calculatedRoles;
    const isAdmin = roles.includes('admin');
    const isCoach = isAdmin || roles.includes('coach');
    const isCustomer = roles.includes('customer');
    const hasRole = (r: Role) => roles.includes(r);

    // Solo actualizar si hay cambios reales o si estamos cargando
    if (
      state.role === role &&
      JSON.stringify(state.roles) === JSON.stringify(roles) &&
      state.isAdmin === isAdmin &&
      state.isCoach === isCoach &&
      state.isCustomer === isCustomer &&
      !state.isLoading
    ) {
      return;
    }

    setState({
      role,
      roles,
      isAdmin,
      isCoach,
      isCustomer,
      hasRole,
      isLoading: false
    });
  }, [calculatedRole, calculatedRoles, status, state]);

  // Memoize the updateRole function to prevent unnecessary re-renders
  const updateRole = useMemo(() => (role: Role) => {
    setState(prev => {
      // Asegurarse de que el rol principal esté en el array de roles
      const newRoles = prev.roles.includes(role) 
        ? [...prev.roles] 
        : [role, ...prev.roles.filter(r => r !== prev.role)];
      
      const isAdmin = newRoles.includes('admin');
      const isCoach = isAdmin || newRoles.includes('coach');
      const isCustomer = newRoles.includes('customer');
      const hasRole = (r: Role) => newRoles.includes(r);

      // Only update if there are actual changes
      if (
        prev.role === role &&
        JSON.stringify(prev.roles) === JSON.stringify(newRoles) &&
        prev.isAdmin === isAdmin &&
        prev.isCoach === isCoach &&
        prev.isCustomer === isCustomer &&
        !prev.isLoading
      ) {
        return prev;
      }

      return {
        role,
        roles: newRoles,
        isAdmin,
        isCoach,
        isCustomer,
        hasRole,
        isLoading: false
      };
    });
  }, []);

  // Función para actualizar todos los roles
  const updateRoles = useMemo(() => (roles: Role[]) => {
    setState(prev => {
      if (roles.length === 0) {
        roles = ['customer']; // Siempre debe tener al menos un rol
      }
      
      const role = roles[0]; // El primer rol es el principal
      const isAdmin = roles.includes('admin');
      const isCoach = isAdmin || roles.includes('coach');
      const isCustomer = roles.includes('customer');
      const hasRole = (r: Role) => roles.includes(r);

      // Only update if there are actual changes
      if (
        prev.role === role &&
        JSON.stringify(prev.roles) === JSON.stringify(roles) &&
        prev.isAdmin === isAdmin &&
        prev.isCoach === isCoach &&
        prev.isCustomer === isCustomer &&
        !prev.isLoading
      ) {
        return prev;
      }

      return {
        role,
        roles,
        isAdmin,
        isCoach,
        isCustomer,
        hasRole,
        isLoading: false
      };
    });
  }, []);

  // Función para añadir un rol
  const addRole = useMemo(() => (role: Role) => {
    setState(prev => {
      if (prev.roles.includes(role)) {
        return prev; // No hacer nada si ya tiene el rol
      }
      
      const newRoles = [...prev.roles, role];
      const isAdmin = newRoles.includes('admin');
      const isCoach = isAdmin || newRoles.includes('coach');
      const isCustomer = newRoles.includes('customer');
      const hasRole = (r: Role) => newRoles.includes(r);

      return {
        role: prev.role, // Mantener el rol principal
        roles: newRoles,
        isAdmin,
        isCoach,
        isCustomer,
        hasRole,
        isLoading: false
      };
    });
  }, []);

  // Función para eliminar un rol
  const removeRole = useMemo(() => (role: Role) => {
    setState(prev => {
      if (!prev.roles.includes(role) || prev.roles.length <= 1) {
        return prev; // No hacer nada si no tiene el rol o solo tiene un rol
      }
      
      const newRoles = prev.roles.filter(r => r !== role);
      const newMainRole = prev.role === role ? newRoles[0] : prev.role;
      const isAdmin = newRoles.includes('admin');
      const isCoach = isAdmin || newRoles.includes('coach');
      const isCustomer = newRoles.includes('customer');
      const hasRole = (r: Role) => newRoles.includes(r);

      return {
        role: newMainRole,
        roles: newRoles,
        isAdmin,
        isCoach,
        isCustomer,
        hasRole,
        isLoading: false
      };
    });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    updateRole,
    updateRoles,
    addRole,
    removeRole
  }), [state, updateRole, updateRoles, addRole, removeRole]);

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