'use client';

import React, { memo } from 'react';
import { Calendar, ChevronRight, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Define WorkoutListItem type for the component
interface WorkoutListItem {
  id: string;
  name: string;
  days?: any[];
  createdAt: string;
  updatedAt: string;
  coachId?: string;
  isShared?: boolean;
  _id?: string;
  description?: string;
}

interface WorkoutItemProps {
  workout: WorkoutListItem;
  isCoach?: boolean;
  onClick?: () => void;
}

const WorkoutItem = memo(function WorkoutItem({ 
  workout, 
  isCoach = false,
  onClick 
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
        
        {/* Coach indicator */}
        {workout.isShared && (
          <div className="flex items-center mr-4 text-sm text-indigo-600 dark:text-indigo-400">
            <Users className="w-4 h-4 mr-1" />
            <span>Compartido</span>
          </div>
        )}
        
        {/* Navigation chevron */}
        <div className="text-gray-400">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
});

export default WorkoutItem; 