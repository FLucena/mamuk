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
    
    // Check if role is displayed (with star for primary role)
    const roleElement = screen.getByText('Cliente');
    expect(roleElement).toBeInTheDocument();
    
    // Check that the role element has a star (★) before it
    const roleElementParent = roleElement.parentElement;
    expect(roleElementParent.textContent).toContain('★');
  });

  it('should display users with multiple roles correctly', () => {
    render(<UserList users={[multiRoleUser]} />);
    
    // Check if user name is displayed
    expect(screen.getByText('Multi Role User')).toBeInTheDocument();
    
    // Check if email is displayed
    expect(screen.getByText('multi@example.com')).toBeInTheDocument();
    
    // Check if primary role (admin) is displayed with a star
    const adminRoleElement = screen.getByText('Administrador');
    expect(adminRoleElement).toBeInTheDocument();
    const adminRoleElementParent = adminRoleElement.parentElement;
    expect(adminRoleElementParent.textContent).toContain('★');
    
    // Check if secondary roles are displayed without stars
    const coachRoleElement = screen.getByText('Coach');
    expect(coachRoleElement).toBeInTheDocument();
    
    const customerRoleElement = screen.getByText('Cliente');
    expect(customerRoleElement).toBeInTheDocument();
    
    // Verify that there are exactly 3 role badges (admin, coach, customer)
    const roleBadges = screen.getAllByText(/Administrador|Coach|Cliente/);
    expect(roleBadges).toHaveLength(3);
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
    
    // Check if role is displayed with a star
    const roleElement = screen.getByText('Coach');
    expect(roleElement).toBeInTheDocument();
    const roleElementParent = roleElement.parentElement;
    expect(roleElementParent.textContent).toContain('★');
    
    // Verify that there is exactly 1 role badge
    const roleBadges = screen.getAllByText(/Administrador|Coach|Cliente/);
    expect(roleBadges).toHaveLength(1);
  });

  it('should display multiple users with different role configurations', () => {
    render(<UserList users={users} />);
    
    // Check if both users are displayed
    expect(screen.getByText('Single Role User')).toBeInTheDocument();
    expect(screen.getByText('Multi Role User')).toBeInTheDocument();
    
    // Check if all roles are displayed correctly
    const roleBadges = screen.getAllByText(/Administrador|Coach|Cliente/);
    expect(roleBadges).toHaveLength(4); // 1 for single role user + 3 for multi role user
  });
}); 