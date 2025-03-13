/**
 * Test for displaying user roles in the UI
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a simple component to test role display
const UserRolesDisplay = ({ user }) => {
  const { role, roles } = user;
  
  // Determine which roles to display
  const rolesToDisplay = roles || [role];
  
  // Get primary role (either the role property or the first role in roles array)
  const primaryRole = role || (roles && roles[0]);
  
  return (
    <div data-testid="user-roles-container">
      <div data-testid="primary-role">{primaryRole}</div>
      <div data-testid="all-roles">
        {rolesToDisplay.map((r, index) => (
          <span key={index} data-testid={`role-${r}`} className="role-badge">
            {r}
          </span>
        ))}
      </div>
    </div>
  );
};

describe('User Roles Display', () => {
  it('should display a single role correctly', () => {
    const user = {
      id: '1',
      name: 'Single Role User',
      email: 'single@example.com',
      role: 'customer',
      // No roles array
    };
    
    render(<UserRolesDisplay user={user} />);
    
    // Check primary role
    expect(screen.getByTestId('primary-role')).toHaveTextContent('customer');
    
    // Check that only one role badge is displayed
    const roleBadges = screen.getAllByTestId(/^role-/);
    expect(roleBadges).toHaveLength(1);
    expect(roleBadges[0]).toHaveTextContent('customer');
  });
  
  it('should display multiple roles correctly', () => {
    const user = {
      id: '2',
      name: 'Multi Role User',
      email: 'multi@example.com',
      role: 'admin', // Primary role
      roles: ['admin', 'coach', 'customer'], // All roles
    };
    
    render(<UserRolesDisplay user={user} />);
    
    // Check primary role
    expect(screen.getByTestId('primary-role')).toHaveTextContent('admin');
    
    // Check that all role badges are displayed
    const roleBadges = screen.getAllByTestId(/^role-/);
    expect(roleBadges).toHaveLength(3);
    
    // Check individual roles
    expect(screen.getByTestId('role-admin')).toBeInTheDocument();
    expect(screen.getByTestId('role-coach')).toBeInTheDocument();
    expect(screen.getByTestId('role-customer')).toBeInTheDocument();
  });
  
  it('should handle a user with roles array but no role property', () => {
    const user = {
      id: '3',
      name: 'Roles Array User',
      email: 'roles@example.com',
      // No role property
      roles: ['coach', 'customer'],
    };
    
    render(<UserRolesDisplay user={user} />);
    
    // Check primary role (should be first in roles array)
    expect(screen.getByTestId('primary-role')).toHaveTextContent('coach');
    
    // Check that all role badges are displayed
    const roleBadges = screen.getAllByTestId(/^role-/);
    expect(roleBadges).toHaveLength(2);
    
    // Check individual roles
    expect(screen.getByTestId('role-coach')).toBeInTheDocument();
    expect(screen.getByTestId('role-customer')).toBeInTheDocument();
  });
  
  it('should handle a user with empty roles array', () => {
    const user = {
      id: '4',
      name: 'Empty Roles User',
      email: 'empty@example.com',
      role: 'customer',
      roles: [], // Empty roles array
    };
    
    render(<UserRolesDisplay user={user} />);
    
    // Check primary role
    expect(screen.getByTestId('primary-role')).toHaveTextContent('customer');
    
    // Check that no role badges are displayed
    const roleBadges = screen.queryAllByTestId(/^role-/);
    expect(roleBadges).toHaveLength(0);
  });
}); 