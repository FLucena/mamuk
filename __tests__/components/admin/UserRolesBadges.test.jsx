/**
 * Test for displaying user role badges in the UI
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a simple component to test role badges
const UserRolesBadges = ({ user }) => {
  const { role, roles } = user;
  
  // Determine which roles to display
  const rolesToDisplay = roles || [role];
  
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
    <div data-testid="user-roles-badges">
      {rolesToDisplay.map((r, index) => (
        <span 
          key={index} 
          data-testid={`role-badge-${r}`} 
          className={`role-badge ${getRoleBadgeColor(r)}`}
        >
          {getRoleDisplayName(r)}
        </span>
      ))}
    </div>
  );
};

describe('User Roles Badges', () => {
  it('should display a single role badge correctly', () => {
    const user = {
      id: '1',
      name: 'Single Role User',
      email: 'single@example.com',
      role: 'customer',
      // No roles array
    };
    
    render(<UserRolesBadges user={user} />);
    
    // Check that only one role badge is displayed
    const roleBadge = screen.getByTestId('role-badge-customer');
    expect(roleBadge).toBeInTheDocument();
    expect(roleBadge).toHaveTextContent('Cliente');
    expect(roleBadge).toHaveClass('bg-blue-100');
    expect(roleBadge).toHaveClass('text-blue-800');
  });
  
  it('should display multiple role badges correctly', () => {
    const user = {
      id: '2',
      name: 'Multi Role User',
      email: 'multi@example.com',
      role: 'admin', // Primary role
      roles: ['admin', 'coach', 'customer'], // All roles
    };
    
    render(<UserRolesBadges user={user} />);
    
    // Check admin badge
    const adminBadge = screen.getByTestId('role-badge-admin');
    expect(adminBadge).toBeInTheDocument();
    expect(adminBadge).toHaveTextContent('Admin');
    expect(adminBadge).toHaveClass('bg-purple-100');
    expect(adminBadge).toHaveClass('text-purple-800');
    
    // Check coach badge
    const coachBadge = screen.getByTestId('role-badge-coach');
    expect(coachBadge).toBeInTheDocument();
    expect(coachBadge).toHaveTextContent('Coach');
    expect(coachBadge).toHaveClass('bg-green-100');
    expect(coachBadge).toHaveClass('text-green-800');
    
    // Check customer badge
    const customerBadge = screen.getByTestId('role-badge-customer');
    expect(customerBadge).toBeInTheDocument();
    expect(customerBadge).toHaveTextContent('Cliente');
    expect(customerBadge).toHaveClass('bg-blue-100');
    expect(customerBadge).toHaveClass('text-blue-800');
  });
  
  it('should handle a user with roles array but no role property', () => {
    const user = {
      id: '3',
      name: 'Roles Array User',
      email: 'roles@example.com',
      // No role property
      roles: ['coach', 'customer'],
    };
    
    render(<UserRolesBadges user={user} />);
    
    // Check coach badge
    const coachBadge = screen.getByTestId('role-badge-coach');
    expect(coachBadge).toBeInTheDocument();
    expect(coachBadge).toHaveTextContent('Coach');
    
    // Check customer badge
    const customerBadge = screen.getByTestId('role-badge-customer');
    expect(customerBadge).toBeInTheDocument();
    expect(customerBadge).toHaveTextContent('Cliente');
  });
  
  it('should handle a user with empty roles array', () => {
    const user = {
      id: '4',
      name: 'Empty Roles User',
      email: 'empty@example.com',
      role: 'customer',
      roles: [], // Empty roles array
    };
    
    render(<UserRolesBadges user={user} />);
    
    // Check that no role badges are displayed
    const roleBadges = screen.queryAllByTestId(/^role-badge-/);
    expect(roleBadges).toHaveLength(0);
  });
}); 