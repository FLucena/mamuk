'use client';

import React, { memo } from 'react';
import { Calendar, ChevronRight, Edit, Copy, Trash2, Eye, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useWorkoutLimitStore } from '@/store/workoutLimitStore';

// Define WorkoutListItem type for the component
interface WorkoutListItem {
  id: string;
  name: string;
  days?: unknown[];
  createdAt: string;
  updatedAt: string;
  coachId?: string;
  isShared?: boolean;
  _id?: string;
  description?: string;
  userId: string;
}

interface WorkoutItemProps {
  workout: WorkoutListItem;
  isCoach?: boolean;
  workoutLimitReached?: boolean;
  onView?: (id: string) => void;
  onEdit?: (workout: WorkoutListItem) => void;
  onDuplicate?: (workout: WorkoutListItem) => void;
  onAssign?: (workout: WorkoutListItem) => void;
  onDelete?: (workout: WorkoutListItem) => void;
}

const WorkoutItem = memo(function WorkoutItem({ 
  workout, 
  isCoach = false,
  workoutLimitReached = false,
  onView,
  onEdit,
  onDuplicate,
  onAssign,
  onDelete
}: WorkoutItemProps) {
  // Use the enhanced Zustand store directly
  const { 
    isBlocked, 
    isCoachOrAdmin, 
    formattedMaxAllowed: maxAllowed,
    checkAndBlockAction
  } = useWorkoutLimitStore();
  
  // Determine if duplicate action should be disabled
  const isDuplicateDisabled = (!isCoachOrAdmin && isBlocked) || (workoutLimitReached && !isCoach);
  
  // Format the display text for maxAllowed
  const displayLimit = maxAllowed === Infinity ? 'máximo' : maxAllowed;

  // For better debugging, log relevant state in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('WorkoutItem - duplicate button state:', { 
      name: workout.name,
      isDuplicateDisabled,
      isBlocked,
      isCoachOrAdmin,
      workoutLimitReached, 
      isCoach
    });
  }

  // Create tooltip text
  const duplicateTooltip = isDuplicateDisabled
    ? `Has alcanzado el límite de ${displayLimit} rutinas personales`
    : `Duplicar rutina ${workout.name}`;

  // Only convert if string, handle case where it might already be a Date
  const updatedAt = typeof workout.updatedAt === 'string' 
    ? new Date(workout.updatedAt) 
    : workout.updatedAt;
    
  const timeAgo = formatDistanceToNow(updatedAt, { 
    addSuffix: true,
    locale: es 
  });

  // Count days
  const daysCount = workout.days?.length || 0;
  
  // Handler for duplicate button - will block action if needed
  const handleDuplicate = (e: React.MouseEvent) => {
    if (isDuplicateDisabled) {
      // Use the checkAndBlockAction to handle the blocking and show message
      if (checkAndBlockAction(e)) {
        return; // Action was blocked, bail out
      }
    }
    
    if (onDuplicate) {
      onDuplicate(workout);
    }
  };

  return (
    <div 
      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-200 dark:border-gray-800"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onView?.(workout.id as string)}
      aria-label={`Ver rutina ${workout.name}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Workout name */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {workout.name}
          </h3>
          
          {/* Workout days info */}
          <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{daysCount} {daysCount === 1 ? 'día' : 'días'}</span>
          </div>
          
          {/* Description if available */}
          {workout.description && (
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {workout.description}
            </div>
          )}
          
          {/* Last updated */}
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Actualizado {timeAgo}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Edit button - Always show if onEdit is provided */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(workout);
              }}
              className="inline-flex items-center justify-center p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label={`Editar rutina ${workout.name}`}
              data-testid="edit-workout-button"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
          
          {/* Duplicate button */}
          {onDuplicate && (
            <button
              onClick={handleDuplicate}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isDuplicateDisabled
                  ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 cursor-pointer'
              }`}
              aria-label={duplicateTooltip}
              title={duplicateTooltip}
              disabled={isDuplicateDisabled}
              data-blocked={isDuplicateDisabled}
            >
              <Copy className="w-5 h-5" />
            </button>
          )}
          
          {/* Assign button */}
          {isCoach && onAssign && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAssign(workout);
              }}
              className="inline-flex items-center justify-center p-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label={`Asignar rutina ${workout.name}`}
            >
              <Users className="w-5 h-5" />
            </button>
          )}
          
          {/* Delete button */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(workout);
              }}
              className="inline-flex items-center justify-center p-2 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              aria-label={`Eliminar rutina ${workout.name}`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          
          {/* Navigation chevron */}
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
});

export default WorkoutItem;