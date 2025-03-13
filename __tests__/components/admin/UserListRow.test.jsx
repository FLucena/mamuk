/**
 * Test for displaying a user row in the admin user list
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a simple component to test user row display
const UserListRow = ({ user }) => {
  const { id, name, email, role, roles } = user;
  
  // Determine which roles to display
  const rolesToDisplay = roles || [role];
  
  // Get primary role (either the role property or the first role in roles array)
  const primaryRole = role || (roles && roles[0]);
  
  // Map role to badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'coach':
        return 'bg-green-100 text-green-800';
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Map role to display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'coach':
        return 'Coach';
      case 'customer':
        return 'Cliente';
      default:
        return role;
    }
  };
  
  return (
    <tr data-testid={`user-row-${id}`}>
      <td data-testid="user-name">{name}</td>
      <td data-testid="user-email">{email}</td>
      <td data-testid="user-primary-role">{getRoleDisplayName(primaryRole)}</td>
      <td data-testid="user-roles-badges">
        {rolesToDisplay.map((r, index) => (
          <span 
            key={index} 
            data-testid={`role-badge-${r}`} 
            className={`role-badge ${getRoleBadgeColor(r)}`}
          >
            {getRoleDisplayName(r)}
          </span>
        ))}
      </td>
    </tr>
  );
};

describe('User List Row', () => {
  it('should display a user with a single role correctly', () => {
    const user = {
      id: '1',
      name: 'Single Role User',
      email: 'single@example.com',
      role: 'customer',
      // No roles array
    };
    
    render(<table><tbody><UserListRow user={user} /></tbody></table>);
    
    // Check user info
    expect(screen.getByTestId('user-name')).toHaveTextContent('Single Role User');
    expect(screen.getByTestId('user-email')).toHaveTextContent('single@example.com');
    expect(screen.getByTestId('user-primary-role')).toHaveTextContent('Cliente');
    
    // Check that only one role badge is displayed
    const roleBadge = screen.getByTestId('role-badge-customer');
    expect(roleBadge).toBeInTheDocument();
    expect(roleBadge).toHaveTextContent('Cliente');
    expect(roleBadge).toHaveClass('bg-blue-100');
    expect(roleBadge).toHaveClass('text-blue-800');
  });
  
  it('should display a user with multiple roles correctly', () => {
    const user = {
      id: '2',
      name: 'Multi Role User',
      email: 'multi@example.com',
      role: 'admin', // Primary role
      roles: ['admin', 'coach', 'customer'], // All roles
    };
    
    render(<table><tbody><UserListRow user={user} /></tbody></table>);
    
    // Check user info
    expect(screen.getByTestId('user-name')).toHaveTextContent('Multi Role User');
    expect(screen.getByTestId('user-email')).toHaveTextContent('multi@example.com');
    expect(screen.getByTestId('user-primary-role')).toHaveTextContent('Admin');
    
    // Check that all role badges are displayed
    const adminBadge = screen.getByTestId('role-badge-admin');
    expect(adminBadge).toBeInTheDocument();
    expect(adminBadge).toHaveTextContent('Admin');
    
    const coachBadge = screen.getByTestId('role-badge-coach');
    expect(coachBadge).toBeInTheDocument();
    expect(coachBadge).toHaveTextContent('Coach');
    
    const customerBadge = screen.getByTestId('role-badge-customer');
    expect(customerBadge).toBeInTheDocument();
    expect(customerBadge).toHaveTextContent('Cliente');
  });
  
  it('should handle a user with roles array but no role property', () => {
    const user = {
      id: '3',
      name: 'Roles Array User',
      email: 'roles@example.com',
      // No role property
      roles: ['coach', 'customer'],
    };
    
    render(<table><tbody><UserListRow user={user} /></tbody></table>);
    
    // Check user info
    expect(screen.getByTestId('user-name')).toHaveTextContent('Roles Array User');
    expect(screen.getByTestId('user-email')).toHaveTextContent('roles@example.com');
    expect(screen.getByTestId('user-primary-role')).toHaveTextContent('Coach');
    
    // Check that all role badges are displayed
    const coachBadge = screen.getByTestId('role-badge-coach');
    expect(coachBadge).toBeInTheDocument();
    expect(coachBadge).toHaveTextContent('Coach');
    
    const customerBadge = screen.getByTestId('role-badge-customer');
    expect(customerBadge).toBeInTheDocument();
    expect(customerBadge).toHaveTextContent('Cliente');
  });
}); 