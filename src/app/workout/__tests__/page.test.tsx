import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import WorkoutPage from '../page';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock dynamic imports
jest.mock('next/dynamic', () => (fn: any) => {
  const Component = fn();
  Component.displayName = 'DynamicComponent';
  return Component;
});

// Mock components
jest.mock('@/components/ui/PageLoading', () => ({
  __esModule: true,
  default: () => <div data-testid="page-loading">Loading...</div>,
}));

jest.mock('@/components/workout/WorkoutHeaderWrapper', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div data-testid="workout-header">{title}</div>,
}));

jest.mock('@/components/workout/WorkoutList', () => ({
  __esModule: true,
  default: ({ workouts }: { workouts: any[] }) => (
    <div data-testid="workout-list">
      {workouts.map((w) => (
        <div key={w.id}>{w.name}</div>
      ))}
    </div>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

describe('WorkoutPage', () => {
  const mockSession = {
    data: {
      user: {
        roles: ['customer'],
      },
      expires: '2024-03-15',
    },
    status: 'authenticated',
  };

  const mockRouter = {
    prefetch: jest.fn(),
  };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue(mockSession);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockReset();
  });

  it('renders loading state when checking authentication', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    render(<WorkoutPage />);
    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
  });

  it('renders workout list when data is loaded', async () => {
    const mockWorkouts = [
      { id: '1', name: 'Workout 1' },
      { id: '2', name: 'Workout 2' },
    ];

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ workouts: mockWorkouts }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ count: 1 }),
        })
      );

    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('workout-list')).toBeInTheDocument();
    });

    expect(screen.getByText('Workout 1')).toBeInTheDocument();
    expect(screen.getByText('Workout 2')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
    );

    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByText(/Error fetching workouts/i)).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    const mockWorkouts = [{ id: '1', name: 'Workout 1' }];

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ workouts: mockWorkouts }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ count: 1 }),
        })
      );

    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('workout-list')).toBeInTheDocument();
    });

    const refreshButton = screen.getAllByLabelText('Refrescar rutinas')[0];
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(4); // Initial load (2 calls) + refresh (2 calls)
    });
  });
}); 