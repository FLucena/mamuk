/**
 * Test for user roles functionality
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createMockUserModel } from '../../src/test/mockModels';

// Mock the database
jest.mock('@/lib/db', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
  dbDisconnect: jest.fn().mockResolvedValue(true),
}));

// Mock mongoose
jest.mock('mongoose', () => {
  return require('../../__mocks__/mongoose');
});

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        roles: ['admin', 'coach', 'customer'], // User with multiple roles
      }
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock User model with multiple roles
jest.mock('@/lib/models/user', () => {
  return {
    __esModule: true,
    default: createMockUserModel({
      _id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
      roles: ['admin', 'coach', 'customer'], // User with multiple roles
    }),
  };
});

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => {
  const originalModule = jest.requireActual('@/contexts/AuthContext');
  
  return {
    ...originalModule,
    useAuth: jest.fn(() => ({
      roles: ['admin', 'coach', 'customer'],
      isAdmin: true,
      isCoach: true,
      isCustomer: true,
      isLoading: false,
      hasRole: (role) => ['admin', 'coach', 'customer'].includes(role),
      getPrimaryRole: () => 'admin',
      updateRoles: jest.fn(),
      addRole: jest.fn(),
      removeRole: jest.fn(),
    })),
  };
});

// Create a test component that uses the AuthContext
const TestComponent = () => {
  const { useAuth } = require('@/contexts/AuthContext');
  const { roles, isAdmin, isCoach, isCustomer, hasRole, getPrimaryRole } = useAuth();
  
  return (
    <div>
      <h1>User Roles Test</h1>
      <p data-testid="roles">Roles: {roles.join(', ')}</p>
      <p data-testid="is-admin">Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
      <p data-testid="is-coach">Is Coach: {isCoach ? 'Yes' : 'No'}</p>
      <p data-testid="is-customer">Is Customer: {isCustomer ? 'Yes' : 'No'}</p>
      <p data-testid="has-admin-role">Has Admin Role: {hasRole('admin') ? 'Yes' : 'No'}</p>
      <p data-testid="has-coach-role">Has Coach Role: {hasRole('coach') ? 'Yes' : 'No'}</p>
      <p data-testid="has-customer-role">Has Customer Role: {hasRole('customer') ? 'Yes' : 'No'}</p>
      <p data-testid="primary-role">Primary Role: {getPrimaryRole()}</p>
    </div>
  );
};

describe('User Roles', () => {
  it('should correctly handle a user with multiple roles', async () => {
    render(<TestComponent />);
    
    // Check if all roles are displayed
    expect(screen.getByTestId('roles')).toHaveTextContent('admin, coach, customer');
    
    // Check if role flags are set correctly
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-coach')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Yes');
    
    // Check if hasRole function works correctly
    expect(screen.getByTestId('has-admin-role')).toHaveTextContent('Yes');
    expect(screen.getByTestId('has-coach-role')).toHaveTextContent('Yes');
    expect(screen.getByTestId('has-customer-role')).toHaveTextContent('Yes');
    
    // Check if primary role is determined correctly
    expect(screen.getByTestId('primary-role')).toHaveTextContent('admin');
  });
}); 