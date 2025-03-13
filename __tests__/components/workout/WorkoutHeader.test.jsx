import React from 'react';
import { render, screen } from '@testing-library/react';
import WorkoutHeader from '@/components/workout/WorkoutHeader';

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
        newButtonText="Crear rutina" 
      />
    );
    
    expect(screen.getByText('Crear rutina')).toBeInTheDocument();
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
    
    expect(screen.getByText('Rutinas personales:')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });
  
  it('should not show workout count and limit when not provided', () => {
    render(
      <WorkoutHeader 
        title="Rutinas" 
        hasPermission={true}
      />
    );
    
    expect(screen.queryByText('Rutinas personales:')).not.toBeInTheDocument();
  });
}); 