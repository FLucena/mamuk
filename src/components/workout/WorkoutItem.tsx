'use client';

import React, { memo } from 'react';
import { Calendar, ChevronRight, Edit, Copy, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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
  onClick?: () => void;
  onEditClick?: (e: React.MouseEvent, workout: WorkoutListItem) => void;
  onDuplicateClick?: (workout: WorkoutListItem) => void;
  onDeleteClick?: (workout: WorkoutListItem) => void;
}

const WorkoutItem = memo(function WorkoutItem({ 
  workout, 
  isCoach = false,
  onClick,
  onEditClick,
  onDuplicateClick,
  onDeleteClick
}: WorkoutItemProps) {
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
  
  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick(e, workout);
    }
  };

  // Handle duplicate button click
  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicateClick) {
      onDuplicateClick(workout);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(workout);
    }
  };
  
  return (
    <div 
      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-200 dark:border-gray-800"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
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
          {/* Edit button - Always show if onEditClick is provided */}
          {onEditClick && (
            <button
              onClick={handleEditClick}
              className="inline-flex items-center justify-center p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label={`Editar rutina ${workout.name}`}
              data-testid="edit-workout-button"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
          
          {/* Duplicate button */}
          {onDuplicateClick && (
            <button
              onClick={handleDuplicateClick}
              className="inline-flex items-center justify-center p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label={`Duplicar rutina ${workout.name}`}
            >
              <Copy className="w-5 h-5" />
            </button>
          )}
          
          {/* Delete button */}
          {onDeleteClick && (
            <button
              onClick={handleDeleteClick}
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