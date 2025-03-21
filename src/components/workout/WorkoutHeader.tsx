'use client';

import { memo } from 'react';
import WorkoutCreationBlocker from './WorkoutCreationBlocker';

interface WorkoutHeaderProps {
  title: string;
  newButtonText?: string;
  hasPermission: boolean;
  workoutCount?: number;
  workoutLimit?: number;
}

// Use memo to prevent unnecessary re-renders
const WorkoutHeader = memo(function WorkoutHeader({ 
  title, 
  newButtonText = 'Nueva rutina', 
  hasPermission,
  workoutCount,
  workoutLimit
}: WorkoutHeaderProps) {
  // Determine if we should show the workout limit counter
  const showWorkoutLimit = workoutCount !== undefined && workoutLimit !== undefined;
  
  return (
    <div className="flex flex-col mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {hasPermission && (
          <WorkoutCreationBlocker 
            buttonText={newButtonText}
            className="w-full sm:w-auto text-sm"
          />
        )}
      </div>
      
      {showWorkoutLimit && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Rutinas personales: <span className={`font-medium ${workoutCount === workoutLimit ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-300'}`}>
              {workoutCount} / {workoutLimit}
            </span>
          </p>
        </div>
      )}
    </div>
  );
});

export default WorkoutHeader; 