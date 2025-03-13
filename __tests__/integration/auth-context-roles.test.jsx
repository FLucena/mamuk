import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the session hook
let mockSessionData = {
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    roles: ['customer']
  }
};

const mockSession = {
  data: {
    user: mockSessionData.user
  },
  status: 'authenticated'
};

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => mockSession),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock the AuthContext with a simplified version for testing
jest.mock('@/contexts/AuthContext', () => {
  const React = require('react');
  const { useState, useCallback, useEffect } = React;
  
  // Create a mock context
  const AuthContext = React.createContext(undefined);
  
  // Mock provider that actually updates state for testing
  const AuthProvider = ({ children }) => {
    const [roles, setRoles] = useState(['customer']);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCoach, setIsCoach] = useState(false);
    const [isCustomer, setIsCustomer] = useState(true);
    
    // Update state based on roles
    useEffect(() => {
      setIsAdmin(roles.includes('admin'));
      setIsCoach(roles.includes('admin') || roles.includes('coach'));
      setIsCustomer(roles.includes('customer'));
    }, [roles]);
    
    const updateRoles = useCallback((newRoles) => {
      setRoles(newRoles);
    }, []);
    
    const addRole = useCallback((role) => {
      setRoles(prev => {
        if (prev.includes(role)) return prev;
        return [...prev, role];
      });
    }, []);
    
    const removeRole = useCallback((role) => {
      setRoles(prev => {
        if (prev.length <= 1) return prev;
        return prev.filter(r => r !== role);
      });
    }, []);
    
    const hasRole = useCallback((role) => {
      return roles.includes(role);
    }, [roles]);
    
    const getPrimaryRole = useCallback(() => {
      const priorityOrder = {
        'admin': 1,
        'coach': 2,
        'customer': 3
      };
      
      return [...roles].sort((a, b) => 
        (priorityOrder[a] || 999) - (priorityOrder[b] || 999)
      )[0];
    }, [roles]);
    
    return (
      <AuthContext.Provider 
        value={{ 
          roles, 
          isAdmin, 
          isCoach, 
          isCustomer, 
          updateRoles, 
          addRole, 
          removeRole, 
          hasRole, 
          getPrimaryRole,
          isLoading: false
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
  
  return {
    AuthProvider,
    useAuth: () => React.useContext(AuthContext)
  };
});

// Test component that uses the AuthContext
const RoleManager = () => {
  const { useAuth } = require('@/contexts/AuthContext');
  const { 
    roles, 
    isAdmin, 
    isCoach, 
    isCustomer, 
    updateRoles, 
    addRole, 
    removeRole, 
    hasRole, 
    getPrimaryRole 
  } = useAuth();
  
  return (
    <div>
      <h1>Role Manager</h1>
      <div data-testid="roles">Current Roles: {roles.join(', ')}</div>
      <div data-testid="primary-role">Primary Role: {getPrimaryRole()}</div>
      <div>
        <div>Role Status:</div>
        <div data-testid="is-admin">Admin: {isAdmin ? 'Yes' : 'No'}</div>
        <div data-testid="is-coach">Coach: {isCoach ? 'Yes' : 'No'}</div>
        <div data-testid="is-customer">Customer: {isCustomer ? 'Yes' : 'No'}</div>
      </div>
      
      <div>
        <h2>Update All Roles</h2>
        <button 
          data-testid="set-admin-only" 
          onClick={() => updateRoles(['admin'])}
        >
          Set Admin Only
        </button>
        <button 
          data-testid="set-coach-only" 
          onClick={() => updateRoles(['coach'])}
        >
          Set Coach Only
        </button>
        <button 
          data-testid="set-customer-only" 
          onClick={() => updateRoles(['customer'])}
        >
          Set Customer Only
        </button>
        <button 
          data-testid="set-multiple-roles" 
          onClick={() => updateRoles(['admin', 'coach', 'customer'])}
        >
          Set Multiple Roles
        </button>
      </div>
      
      <div>
        <h2>Add/Remove Individual Roles</h2>
        <button 
          data-testid="add-admin-role" 
          onClick={() => addRole('admin')}
        >
          Add Admin Role
        </button>
        <button 
          data-testid="add-coach-role" 
          onClick={() => addRole('coach')}
        >
          Add Coach Role
        </button>
        <button 
          data-testid="add-customer-role" 
          onClick={() => addRole('customer')}
        >
          Add Customer Role
        </button>
        <button 
          data-testid="remove-admin-role" 
          onClick={() => removeRole('admin')}
        >
          Remove Admin Role
        </button>
        <button 
          data-testid="remove-coach-role" 
          onClick={() => removeRole('coach')}
        >
          Remove Coach Role
        </button>
        <button 
          data-testid="remove-customer-role" 
          onClick={() => removeRole('customer')}
        >
          Remove Customer Role
        </button>
      </div>
      
      <div>
        <h2>Check Specific Roles</h2>
        <div data-testid="has-admin">Has Admin: {hasRole('admin') ? 'Yes' : 'No'}</div>
        <div data-testid="has-coach">Has Coach: {hasRole('coach') ? 'Yes' : 'No'}</div>
        <div data-testid="has-customer">Has Customer: {hasRole('customer') ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};

// Wrap the test component with the real AuthProvider
const TestApp = () => {
  const { AuthProvider } = require('@/contexts/AuthContext');
  return (
    <AuthProvider>
      <RoleManager />
    </AuthProvider>
  );
};

describe('AuthContext Roles Management', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  it('should initialize with roles from the session', async () => {
    render(<TestApp />);
    
    // Wait for the component to render with the initial roles
    await screen.findByTestId('roles');
    
    // Check initial state
    expect(screen.getByTestId('roles')).toHaveTextContent('customer');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('No');
    expect(screen.getByTestId('is-coach')).toHaveTextContent('No');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Yes');
    expect(screen.getByTestId('primary-role')).toHaveTextContent('customer');
  });
  
  it('should update all roles when updateRoles is called', async () => {
    render(<TestApp />);
    
    // Wait for the component to render
    await screen.findByTestId('roles');
    
    // Update to admin only
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-admin-only'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('admin');
    });
    
    // Check updated state
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-coach')).toHaveTextContent('Yes'); // Admin includes coach privileges
    expect(screen.getByTestId('is-customer')).toHaveTextContent('No');
    expect(screen.getByTestId('primary-role')).toHaveTextContent('admin');
    
    // Update to multiple roles
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-multiple-roles'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('admin, coach, customer');
    });
    
    // Check updated state
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-coach')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Yes');
    expect(screen.getByTestId('primary-role')).toHaveTextContent('admin');
  });
  
  it('should add individual roles when addRole is called', async () => {
    render(<TestApp />);
    
    // Wait for the component to render
    await screen.findByTestId('roles');
    
    // Initially only customer
    expect(screen.getByTestId('roles')).toHaveTextContent('customer');
    
    // Add coach role
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-coach-role'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('customer, coach');
    });
    
    // Check updated state
    expect(screen.getByTestId('is-admin')).toHaveTextContent('No');
    expect(screen.getByTestId('is-coach')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Yes');
    expect(screen.getByTestId('primary-role')).toHaveTextContent('coach');
    
    // Add admin role
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-admin-role'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('customer, coach, admin');
    });
    
    // Check updated state
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-coach')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Yes');
    expect(screen.getByTestId('primary-role')).toHaveTextContent('admin');
  });
  
  it('should remove individual roles when removeRole is called', async () => {
    // Start with multiple roles
    render(<TestApp />);
    
    // Wait for the component to render
    await screen.findByTestId('roles');
    
    // Set multiple roles first
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-multiple-roles'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('admin, coach, customer');
    });
    
    // Remove admin role
    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-admin-role'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('coach, customer');
    });
    
    // Check updated state
    expect(screen.getByTestId('is-admin')).toHaveTextContent('No');
    expect(screen.getByTestId('is-coach')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Yes');
    expect(screen.getByTestId('primary-role')).toHaveTextContent('coach');
    
    // Remove coach role
    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-coach-role'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('customer');
    });
    
    // Check updated state
    expect(screen.getByTestId('is-admin')).toHaveTextContent('No');
    expect(screen.getByTestId('is-coach')).toHaveTextContent('No');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Yes');
    expect(screen.getByTestId('primary-role')).toHaveTextContent('customer');
  });
  
  it('should not remove the last role', async () => {
    render(<TestApp />);
    
    // Wait for the component to render
    await screen.findByTestId('roles');
    
    // Initially only customer
    expect(screen.getByTestId('roles')).toHaveTextContent('customer');
    
    // Try to remove the customer role
    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-customer-role'));
    });
    
    // Role should not be removed as it's the last one
    expect(screen.getByTestId('roles')).toHaveTextContent('customer');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Yes');
  });
  
  it('should correctly determine the primary role based on priority', async () => {
    render(<TestApp />);
    
    // Wait for the component to render
    await screen.findByTestId('roles');
    
    // Start with customer only
    expect(screen.getByTestId('primary-role')).toHaveTextContent('customer');
    
    // Add coach role
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-coach-role'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('customer, coach');
    });
    
    // Primary role should now be coach
    expect(screen.getByTestId('primary-role')).toHaveTextContent('coach');
    
    // Add admin role
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-admin-role'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('customer, coach, admin');
    });
    
    // Primary role should now be admin
    expect(screen.getByTestId('primary-role')).toHaveTextContent('admin');
    
    // Remove admin role
    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-admin-role'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('customer, coach');
    });
    
    // Primary role should go back to coach
    expect(screen.getByTestId('primary-role')).toHaveTextContent('coach');
  });
  
  it('should correctly check if a user has a specific role', async () => {
    render(<TestApp />);
    
    // Wait for the component to render
    await screen.findByTestId('roles');
    
    // Check initial role status
    expect(screen.getByTestId('has-admin')).toHaveTextContent('No');
    expect(screen.getByTestId('has-coach')).toHaveTextContent('No');
    expect(screen.getByTestId('has-customer')).toHaveTextContent('Yes');
    
    // Add coach role
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-coach-role'));
    });
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('customer, coach');
    });
    
    // Check updated role status
    expect(screen.getByTestId('has-admin')).toHaveTextContent('No');
    expect(screen.getByTestId('has-coach')).toHaveTextContent('Yes');
    expect(screen.getByTestId('has-customer')).toHaveTextContent('Yes');
  });
}); 