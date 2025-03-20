'use client';

import { memo } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

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
          <Link
            href="/workout/new"
            className="inline-flex items-center justify-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            {newButtonText}
          </Link>
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