/**
 * Complete test example using all mocks
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Import mock helpers
import { createMockUserModel, createMockWorkoutModel } from '../../src/test/mockModels';
import { createMockNavigationContext, createMockAuthContext } from '../../src/test/mockNextjs';

// Mock the database
jest.mock('@/lib/db', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
  dbDisconnect: jest.fn().mockResolvedValue(true),
}));

// Mock mongoose
jest.mock('mongoose', () => {
  return require('../../__mocks__/mongoose');
});

// Mock Next.js navigation
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
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        roles: ['customer'],
      }
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock User model
jest.mock('@/lib/models/user', () => {
  return {
    __esModule: true,
    default: createMockUserModel({
      _id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      roles: ['customer'],
    }),
  };
});

// Mock Workout model
jest.mock('@/lib/models/workout', () => {
  return {
    __esModule: true,
    default: createMockWorkoutModel({
      _id: 'workout-123',
      name: 'Test Workout',
      description: 'Test Description',
      userId: 'user-123',
    }),
  };
});

// Mock NavigationContext
const mockNavigationContext = createMockNavigationContext();
jest.mock('@/contexts/NavigationContext', () => mockNavigationContext);

// Mock AuthContext
const mockAuthContext = createMockAuthContext();
jest.mock('@/contexts/AuthContext', () => mockAuthContext);

// Mock fetch
global.fetch = jest.fn().mockImplementation((url) => {
  if (url === '/api/workout') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'workout-123',
          name: 'Test Workout',
          description: 'Test Description',
          userId: 'user-123',
          days: [],
        },
      ]),
    });
  }
  
  if (url === '/api/users/role') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        role: 'customer',
        roles: ['customer'],
      }),
    });
  }
  
  return Promise.reject(new Error('Not found'));
});

// Mock component for testing
const TestComponent = () => {
  const { isNavigating, navigateTo } = mockNavigationContext.useNavigation();
  const { role, roles, updateRole } = mockAuthContext.useAuth();
  
  const handleClick = () => {
    navigateTo('/workout');
    updateRole('coach');
  };
  
  return (
    <div>
      <h1>Test Component</h1>
      <p>Role: {role}</p>
      <p>Roles: {roles.join(', ')}</p>
      <p>Is Navigating: {isNavigating ? 'Yes' : 'No'}</p>
      <button onClick={handleClick}>Navigate</button>
    </div>
  );
};

describe('Complete Test Example', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render the component correctly', () => {
    render(<TestComponent />);
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByText('Role: customer')).toBeInTheDocument();
    expect(screen.getByText('Roles: customer')).toBeInTheDocument();
    expect(screen.getByText('Is Navigating: No')).toBeInTheDocument();
  });
  
  it('should handle navigation and role update', async () => {
    render(<TestComponent />);
    
    // Click the button
    fireEvent.click(screen.getByText('Navigate'));
    
    // Check if navigateTo was called
    expect(mockNavigationContext.useNavigation().navigateTo).toHaveBeenCalledWith('/workout');
    
    // Check if updateRole was called
    expect(mockAuthContext.useAuth().updateRole).toHaveBeenCalledWith('coach');
  });
  
  it('should fetch data from API', async () => {
    // Make a fetch request
    const response = await fetch('/api/workout');
    const data = await response.json();
    
    // Check the response
    expect(data).toEqual([
      {
        id: 'workout-123',
        name: 'Test Workout',
        description: 'Test Description',
        userId: 'user-123',
        days: [],
      },
    ]);
    
    // Check if fetch was called
    expect(global.fetch).toHaveBeenCalledWith('/api/workout');
  });
}); 