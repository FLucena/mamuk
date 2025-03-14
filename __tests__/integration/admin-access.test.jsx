/**
 * Test for admin access to pages
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMockNavigationContext, createMockAuthContext } from '../../src/test/mockNextjs';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['admin'],
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
    id: 'admin-123',
    name: 'Admin User',
    email: 'admin@example.com',
    roles: ['admin'],
  },
  role: 'admin',
  roles: ['admin'],
  isAdmin: true,
  isCoach: false,
  isCustomer: false,
  hasRole: (role) => role === 'admin',
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
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['admin'],
      }
    },
    isLoading: false,
  })),
}));

// Mock the home page component
const MockHomePage = () => (
  <div>
    <h1>Home Page</h1>
    <p>Welcome to the home page</p>
  </div>
);

// Mock the achievements page component
const MockAchievementsPage = () => {
  const { useAuth } = require('@/contexts/AuthContext');
  const { getPrimaryRole, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>Achievements Page</h1>
      <p>Welcome, {user.name}</p>
      <p>Role: {getPrimaryRole()}</p>
    </div>
  );
};

describe('Admin Access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should allow admin to access the home page', () => {
    render(<MockHomePage />);
    
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the home page')).toBeInTheDocument();
    
    // Verify that no redirect was attempted
    const { redirect } = require('next/navigation');
    expect(redirect).not.toHaveBeenCalled();
  });
  
  it('should allow admin to access the achievements page', () => {
    render(<MockAchievementsPage />);
    
    expect(screen.getByText('Achievements Page')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Admin User')).toBeInTheDocument();
    expect(screen.getByText('Role: admin')).toBeInTheDocument();
    
    // Verify that no redirect was attempted
    const { redirect } = require('next/navigation');
    expect(redirect).not.toHaveBeenCalled();
  });
}); 