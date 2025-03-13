import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import { signOut } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock the theme provider
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

// Mock the view transition router hook
jest.mock('@/hooks/useViewTransitionRouter', () => ({
  useViewTransitionRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

describe('Navbar Sign Out Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should display sign in button when not authenticated', () => {
    // Mock the useSession hook to return unauthenticated session
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    
    // Render the navbar
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    
    // Verify sign in button is displayed
    const signInButton = screen.getByText(/iniciar sesión/i);
    expect(signInButton).toBeInTheDocument();
  });
  
  it('should show authenticated user data', () => {
    // Mock the useSession hook to return authenticated session
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          image: null,
          roles: ['customer'],
        },
        expires: '2023-01-01T00:00:00.000Z',
      },
      status: 'authenticated',
    });
    
    // Render the navbar
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    
    // Verify user name is displayed
    const userNameElement = screen.getAllByText('Test User')[0];
    expect(userNameElement).toBeInTheDocument();
  });
}); 