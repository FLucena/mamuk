/**
 * Test for UserList component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import UserList from '@/components/admin/UserList';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the EditUserModal and DeleteUserModal components
jest.mock('@/components/admin/EditUserModal', () => {
  return function MockEditUserModal({ isOpen, onClose, onConfirm, user }) {
    return isOpen ? (
      <div data-testid="edit-user-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onConfirm({ name: user.name, email: user.email, roles: user.roles })}>
          Confirm
        </button>
      </div>
    ) : null;
  };
});

jest.mock('@/components/admin/DeleteUserModal', () => {
  return function MockDeleteUserModal({ isOpen, onClose, onConfirm }) {
    return isOpen ? (
      <div data-testid="delete-user-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null;
  };
});

describe('UserList Component', () => {
  // Test data
  const singleRoleUser = {
    id: 'user-1',
    name: 'Single Role User',
    email: 'single@example.com',
    roles: ['customer'], // Using roles array instead of role
  };

  const multiRoleUser = {
    id: 'user-2',
    name: 'Multi Role User',
    email: 'multi@example.com',
    roles: ['admin', 'coach', 'customer'],
  };

  const users = [singleRoleUser, multiRoleUser];

  it('should display users with single role correctly', () => {
    render(<UserList users={[singleRoleUser]} />);
    
    // Check if user name is displayed
    expect(screen.getByText('Single Role User')).toBeInTheDocument();
    
    // Check if email is displayed
    expect(screen.getByText('single@example.com')).toBeInTheDocument();
    
    // Check if role is displayed
    const roleElement = screen.getByText('customer');
    expect(roleElement).toBeInTheDocument();
  });

  it('should display users with multiple roles correctly', () => {
    render(<UserList users={[multiRoleUser]} />);
    
    // Check if user name is displayed
    expect(screen.getByText('Multi Role User')).toBeInTheDocument();
    
    // Check if email is displayed
    expect(screen.getByText('multi@example.com')).toBeInTheDocument();
    
    // Check if all roles are displayed
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('coach')).toBeInTheDocument();
    expect(screen.getByText('customer')).toBeInTheDocument();
  });

  it('should handle users with roles array but only one role', () => {
    const userWithRolesArray = {
      id: 'user-3',
      name: 'Single Role in Array',
      email: 'array@example.com',
      roles: ['coach'], // Single role in array
    };
    
    render(<UserList users={[userWithRolesArray]} />);
    
    // Check if user name is displayed
    expect(screen.getByText('Single Role in Array')).toBeInTheDocument();
    
    // Check if email is displayed
    expect(screen.getByText('array@example.com')).toBeInTheDocument();
    
    // Check if role is displayed
    const roleElement = screen.getByText('coach');
    expect(roleElement).toBeInTheDocument();
  });

  it('should display multiple users with different role configurations', () => {
    render(<UserList users={[singleRoleUser, multiRoleUser]} />);
    
    // Check if both users are displayed
    expect(screen.getByText('Single Role User')).toBeInTheDocument();
    expect(screen.getByText('Multi Role User')).toBeInTheDocument();
    
    // Check if all roles are displayed correctly
    const roleBadges = screen.getAllByText(/admin|coach|customer/);
    expect(roleBadges).toHaveLength(4); // 1 for single role user + 3 for multi role user
  });
}); 