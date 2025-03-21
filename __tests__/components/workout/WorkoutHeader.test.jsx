import React from 'react';
import { render, screen } from '@testing-library/react';
import WorkoutHeader from '@/components/workout/WorkoutHeader';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the workoutBlocker hook
jest.mock('@/utils/workoutBlocker', () => ({
  useWorkoutBlocker: jest.fn().mockReturnValue({
    isBlocked: false,
    isCoachOrAdmin: true,
    checkAndBlockAction: jest.fn().mockReturnValue(false),
    maxAllowed: 3
  })
}));

// Mock next/link component
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('WorkoutHeader', () => {
  it('should show the Nueva Rutina button when hasPermission is true', () => {
    render(
      <WorkoutHeader 
        title="Rutinas" 
        hasPermission={true} 
      />
    );
    
    expect(screen.getByText('Nueva rutina')).toBeInTheDocument();
  });
  
  it('should not show the Nueva Rutina button when hasPermission is false', () => {
    render(
      <WorkoutHeader 
        title="Rutinas" 
        hasPermission={false} 
      />
    );
    
    expect(screen.queryByText('Nueva rutina')).not.toBeInTheDocument();
  });
  
  it('should use custom button text when provided', () => {
    render(
      <WorkoutHeader 
        title="Rutinas" 
        hasPermission={true}
        newButtonText="Create Custom Workout" 
      />
    );
    
    expect(screen.getByText('Create Custom Workout')).toBeInTheDocument();
  });
  
  it('should show workout count and limit when provided', () => {
    render(
      <WorkoutHeader 
        title="Rutinas" 
        hasPermission={true}
        workoutCount={2}
        workoutLimit={3}
      />
    );
    
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });
  
  it('should not show workout count and limit when not provided', () => {
    render(
      <WorkoutHeader 
        title="Rutinas" 
        hasPermission={true}
      />
    );
    
    expect(screen.queryByText('0 / 3')).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
  });
}); 