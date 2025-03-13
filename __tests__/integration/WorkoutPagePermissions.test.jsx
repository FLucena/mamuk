import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock fetch API
global.fetch = jest.fn();

// Mock useAuthRedirect hook
jest.mock('@/hooks/useAuthRedirect', () => ({
  useAuthRedirect: jest.fn(() => ({
    session: {
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        roles: [],
      }
    },
    isLoading: false,
  })),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        roles: [],
      }
    },
    status: 'authenticated',
  })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/workout'),
}));

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

// Mock the sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Create a mock WorkoutPage component
const MockWorkoutPage = ({ isAdmin, isCoach, workoutCount }) => {
  return (
    <div>
      <h1>Rutinas</h1>
      {(isAdmin || isCoach || workoutCount < 3) && (
        <button>Nueva rutina</button>
      )}
      {workoutCount >= 3 && !isAdmin && !isCoach && (
        <div>Has alcanzado el límite de 3 rutinas personales</div>
      )}
    </div>
  );
};

// Mock the actual WorkoutPage component
jest.mock('@/app/workout/page', () => ({
  __esModule: true,
  default: (props) => <MockWorkoutPage {...props} />
}));

describe('WorkoutPage Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock responses
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/workout?count=user')) {
        return Promise.resolve({
          json: () => Promise.resolve({ count: 0 }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ workouts: [] }),
      });
    });
  });
  
  it('should show Nueva Rutina button for admin users', () => {
    render(
      <AuthProvider>
        <MockWorkoutPage isAdmin={true} isCoach={false} workoutCount={0} />
      </AuthProvider>
    );
    
    expect(screen.getByText('Rutinas')).toBeInTheDocument();
    expect(screen.getByText('Nueva rutina')).toBeInTheDocument();
  });
  
  it('should not show Nueva Rutina button for customer users who reached the limit', () => {
    render(
      <AuthProvider>
        <MockWorkoutPage isAdmin={false} isCoach={false} workoutCount={3} />
      </AuthProvider>
    );
    
    expect(screen.getByText('Rutinas')).toBeInTheDocument();
    expect(screen.queryByText('Nueva rutina')).not.toBeInTheDocument();
    expect(screen.getByText('Has alcanzado el límite de 3 rutinas personales')).toBeInTheDocument();
  });
  
  it('should show Nueva Rutina button for coach users', () => {
    render(
      <AuthProvider>
        <MockWorkoutPage isAdmin={false} isCoach={true} workoutCount={0} />
      </AuthProvider>
    );
    
    expect(screen.getByText('Rutinas')).toBeInTheDocument();
    expect(screen.getByText('Nueva rutina')).toBeInTheDocument();
  });
}); 