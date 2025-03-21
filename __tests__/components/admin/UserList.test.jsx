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

  it('should display users with a single role correctly', () => {
    render(<UserList users={[singleRoleUser]} />);
    
    // Check if username is displayed
    expect(screen.getAllByText('Single Role User')[0]).toBeInTheDocument();
    
    // Check if email is displayed
    expect(screen.getAllByText('single@example.com')[0]).toBeInTheDocument();
    
    // Check if role is displayed
    const roleElement = screen.getAllByText('customer')[0];
    expect(roleElement).toBeInTheDocument();
  });

  it('should display users with multiple roles correctly', () => {
    render(<UserList users={[multiRoleUser]} />);
    
    // Check if username is displayed
    expect(screen.getAllByText('Multi Role User')[0]).toBeInTheDocument();
    
    // Check if email is displayed
    expect(screen.getAllByText('multi@example.com')[0]).toBeInTheDocument();
    
    // Check if all roles are displayed
    expect(screen.getAllByText('admin')[0]).toBeInTheDocument();
    expect(screen.getAllByText('coach')[0]).toBeInTheDocument();
    expect(screen.getAllByText('customer')[0]).toBeInTheDocument();
  });

  it('should handle users with roles array but only one role', () => {
    const userWithRolesArray = {
      id: 'user-3',
      name: 'Single Role in Array',
      email: 'array@example.com',
      roles: ['coach'], // Single role in array
    };
    
    render(<UserList users={[userWithRolesArray]} />);
    
    // Check if username is displayed
    expect(screen.getAllByText('Single Role in Array')[0]).toBeInTheDocument();
    
    // Check if email is displayed
    expect(screen.getAllByText('array@example.com')[0]).toBeInTheDocument();
    
    // Check if role is displayed
    const roleElement = screen.getAllByText('coach')[0];
    expect(roleElement).toBeInTheDocument();
  });

  it('should display multiple users with different role configurations', () => {
    render(<UserList users={[singleRoleUser, multiRoleUser]} />);
    
    // Check if both users are displayed
    expect(screen.getAllByText('Single Role User')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Multi Role User')[0]).toBeInTheDocument();
    
    // Check if emails are displayed
    expect(screen.getAllByText('single@example.com')[0]).toBeInTheDocument();
    expect(screen.getAllByText('multi@example.com')[0]).toBeInTheDocument();
    
    // Check if role badges are displayed - should have at least 4 badges (could be up to 8 with mobile+desktop views)
    const roleBadges = screen.getAllByText(/customer|admin|coach/);
    expect(roleBadges.length).toBeGreaterThanOrEqual(4);
  });
}); 