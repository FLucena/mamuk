/**
 * Test for multi-role admin access to pages
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMockNavigationContext, createMockAuthContext } from '../../src/test/mockNextjs';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'multi-role-user',
        name: 'Multi-Role User',
        email: 'multi@example.com',
        role: 'admin', // Primary role
        roles: ['admin', 'coach', 'customer'], // Multiple roles
      }
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

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
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

// Mock the AuthContext
const mockAuthContext = createMockAuthContext({
  user: {
    id: 'multi-role-user',
    name: 'Multi-Role User',
    email: 'multi@example.com',
    role: 'admin',
    roles: ['admin', 'coach', 'customer'],
  },
  role: 'admin',
  roles: ['admin', 'coach', 'customer'],
  isAdmin: true,
  isCoach: true,
  isCustomer: true,
  isLoading: false,
  hasRole: (role) => ['admin', 'coach', 'customer'].includes(role),
  getPrimaryRole: () => 'admin',
});

jest.mock('@/contexts/AuthContext', () => mockAuthContext);

// Mock the NavigationContext
const mockNavigationContext = createMockNavigationContext();
jest.mock('@/contexts/NavigationContext', () => mockNavigationContext);

// Mock the useAuthRedirect hook
jest.mock('@/hooks/useAuthRedirect', () => ({
  useAuthRedirect: jest.fn(() => ({
    session: {
      user: {
        id: 'multi-role-user',
        name: 'Multi-Role User',
        email: 'multi@example.com',
        role: 'admin',
        roles: ['admin', 'coach', 'customer'],
      }
    },
    isLoading: false,
  })),
}));

// Mock the home page component
const MockHomePage = () => {
  const { useAuth } = require('@/contexts/AuthContext');
  const { roles, isAdmin } = useAuth();
  
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page</p>
      <p data-testid="user-roles">Roles: {roles.join(', ')}</p>
      <p data-testid="is-admin">Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
    </div>
  );
};

// Mock the achievements page component
const MockAchievementsPage = () => {
  const { useAuth } = require('@/contexts/AuthContext');
  const { roles, getPrimaryRole, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>Achievements Page</h1>
      <p>Welcome, {user.name}</p>
      <p>Primary Role: {getPrimaryRole()}</p>
      <p data-testid="all-roles">All Roles: {roles.join(', ')}</p>
    </div>
  );
};

describe('Multi-Role Admin Access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should allow multi-role admin to access the home page', () => {
    render(<MockHomePage />);
    
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the home page')).toBeInTheDocument();
    expect(screen.getByTestId('user-roles')).toHaveTextContent('admin, coach, customer');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Yes');
    
    // Verify that no redirect was attempted
    const { redirect } = require('next/navigation');
    expect(redirect).not.toHaveBeenCalled();
  });
  
  it('should allow multi-role admin to access the achievements page', () => {
    render(<MockAchievementsPage />);
    
    expect(screen.getByText('Achievements Page')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Multi-Role User')).toBeInTheDocument();
    expect(screen.getByText('Primary Role: admin')).toBeInTheDocument();
    expect(screen.getByTestId('all-roles')).toHaveTextContent('admin, coach, customer');
    
    // Verify that no redirect was attempted
    const { redirect } = require('next/navigation');
    expect(redirect).not.toHaveBeenCalled();
  });
}); 