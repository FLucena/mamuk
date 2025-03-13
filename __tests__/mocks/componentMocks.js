/**
 * Mocks reutilizables para tests de componentes
 */

import React from 'react';

// Mock para AuthContext
export const mockAuthContext = (overrides = {}) => {
  const updateRole = jest.fn();
  const updateRoles = jest.fn();
  const addRole = jest.fn();
  const removeRole = jest.fn();
  
  const defaultValues = {
    role: 'customer',
    roles: ['customer'],
    isAdmin: false,
    isCoach: false,
    isCustomer: true,
    hasRole: (role) => role === 'customer',
    updateRole,
    updateRoles,
    addRole,
    removeRole
  };
  
  return {
    useAuth: jest.fn().mockReturnValue({
      ...defaultValues,
      ...overrides
    }),
    __mocks: {
      updateRole,
      updateRoles,
      addRole,
      removeRole
    }
  };
};

// Mock para NavigationContext
export const mockNavigationContext = (overrides = {}) => {
  const navigateTo = jest.fn();
  
  const defaultValues = {
    isNavigating: false,
    navigateTo
  };
  
  return {
    useNavigation: jest.fn().mockReturnValue({
      ...defaultValues,
      ...overrides
    }),
    __mocks: {
      navigateTo
    }
  };
};

// Mock para next-auth/react
export const mockNextAuth = (sessionData = null) => {
  const defaultSession = {
    data: {
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        roles: ['customer']
      }
    }
  };
  
  const session = sessionData || defaultSession;
  
  return {
    useSession: jest.fn().mockReturnValue(session)
  };
};

// Mock para next/navigation
export const mockNextNavigation = (pathname = '/') => {
  return {
    usePathname: jest.fn().mockReturnValue(pathname)
  };
};

// Mock para componentes UI comunes
export const mockUIComponents = () => {
  return {
    Icon: ({ icon, className }) => (
      <span data-testid={`icon-${icon}`} className={className}></span>
    ),
    LoadingSpinner: ({ size, className }) => (
      <div data-testid="loading-spinner" className={className}></div>
    )
  };
};

// Mock para EditUserModal
export const mockEditUserModal = () => {
  return function MockEditUserModal({ isOpen, onClose, onConfirm, user }) {
    if (!isOpen) return null;
    
    const handleSubmit = (e) => {
      e.preventDefault();
      onConfirm({
        name: user.name,
        email: user.email,
        role: 'admin' // Simulating changing role to admin
      });
    };
    
    return (
      <div data-testid="edit-user-modal">
        <h3>Editar Usuario</h3>
        <form onSubmit={handleSubmit}>
          <button type="submit">Guardar cambios</button>
        </form>
        <button onClick={onClose}>Cancelar</button>
      </div>
    );
  };
};

// Mock para UserRolesManager
export const mockUserRolesManager = () => {
  return function MockUserRolesManager({ userId, initialRoles, onRolesUpdated }) {
    const handleAddRole = () => {
      // Simulate adding coach role
      onRolesUpdated(['admin', 'coach']);
    };
    
    return (
      <div data-testid="user-roles-manager">
        <h3>Roles del Usuario</h3>
        <div>
          {initialRoles.map(role => (
            <span key={role} data-testid={`role-${role}`}>{role}</span>
          ))}
        </div>
        <button onClick={handleAddRole} data-testid="add-role-button">
          Añadir rol de coach
        </button>
      </div>
    );
  };
};

// Datos de ejemplo para tests
export const mockData = {
  users: [
    {
      _id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      roles: ['customer']
    },
    {
      _id: 'user-2',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      roles: ['admin']
    },
    {
      _id: 'user-3',
      name: 'Coach User',
      email: 'coach@example.com',
      role: 'coach',
      roles: ['coach']
    }
  ]
}; 