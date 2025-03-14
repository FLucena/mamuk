import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import RouteGuard from '@/components/RouteGuard';
import { checkRouteAccess } from '@/utils/authNavigation';

// Mock the next-auth/react module
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock the authNavigation utility
jest.mock('@/utils/authNavigation', () => ({
  checkRouteAccess: jest.fn(),
}));

// Mock the LoadingSpinner component
jest.mock('@/components/ui/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('RouteGuard', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    (usePathname as jest.Mock).mockReturnValue('/test-path');
    
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    
    (checkRouteAccess as jest.Mock).mockReturnValue({
      hasAccess: true,
      redirectTo: null,
      reason: 'Test reason',
    });
  });
  
  test('should render loading spinner when session is loading', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });
    
    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  test('should render children when user has access', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { roles: ['customer'] } },
      status: 'authenticated',
    });
    
    (checkRouteAccess as jest.Mock).mockReturnValue({
      hasAccess: true,
      redirectTo: null,
      reason: 'User has access',
    });
    
    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );
    
    // Initially shows loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Then shows content
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
  
  test('should redirect when user does not have access', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { roles: ['customer'] } },
      status: 'authenticated',
    });
    
    (checkRouteAccess as jest.Mock).mockReturnValue({
      hasAccess: false,
      redirectTo: '/unauthorized',
      reason: 'User lacks required role',
    });
    
    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    });
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  test('should redirect unauthenticated users from protected routes', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    
    (checkRouteAccess as jest.Mock).mockReturnValue({
      hasAccess: false,
      redirectTo: '/auth/signin',
      reason: 'User is not authenticated',
    });
    
    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  test('should redirect authenticated users from public routes with redirectAuthenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { roles: ['customer'] } },
      status: 'authenticated',
    });
    
    (checkRouteAccess as jest.Mock).mockReturnValue({
      hasAccess: false,
      redirectTo: '/workout',
      reason: 'User is authenticated but route is public with redirect',
    });
    
    render(
      <RouteGuard>
        <div>Public Content</div>
      </RouteGuard>
    );
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/workout');
    });
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
  });
}); 