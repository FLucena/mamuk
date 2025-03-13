'use client';

import { memo } from 'react';
import WorkoutHeader from './WorkoutHeader';

interface WorkoutHeaderWrapperProps {
  title: string;
  newButtonText?: string;
  hasPermission: boolean;
  workoutCount?: number;
  workoutLimit?: number;
}

// Use memo to prevent unnecessary re-renders
const WorkoutHeaderWrapper = memo(function WorkoutHeaderWrapper({ 
  title, 
  newButtonText,
  hasPermission,
  workoutCount,
  workoutLimit
}: WorkoutHeaderWrapperProps) {
  return (
    <WorkoutHeader 
      title={title} 
      newButtonText={newButtonText} 
      hasPermission={hasPermission}
      workoutCount={workoutCount}
      workoutLimit={workoutLimit}
    />
  );
});

export default WorkoutHeaderWrapper; 