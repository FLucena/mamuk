'use client';

import { useState, useEffect, Dispatch, SetStateAction, memo, useCallback } from 'react';
import { ChevronDown, Plus, Trash } from 'lucide-react';
import Exercise from './Exercise';
import { LoadingOverlay } from '@/components/ui/loading';
import { Exercise as ExerciseType } from '@/types/models';

interface WorkoutBlockProps {
  title: string;
  exercises: ExerciseType[];
  isExpanded?: boolean;
  expandExercises?: boolean;
  expandedExercises?: Record<string, boolean>;
  setExpandedExercises?: Dispatch<SetStateAction<Record<string, boolean>>>;
  onToggle?: () => void;
  onAddExercise?: () => Promise<void>;
  onUpdateExercise?: (index: number, data: Partial<ExerciseType>) => Promise<void>;
  onDeleteExercise?: (index: number) => Promise<void>;
  onUpdateTitle?: (newTitle: string) => Promise<void>;
  onDeleteBlock?: () => Promise<void>;
  showVideosInline?: boolean;
}

// Add comparison function for memo
function arePropsEqual(prevProps: WorkoutBlockProps, nextProps: WorkoutBlockProps) {
  return (
    prevProps.title === nextProps.title &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.expandExercises === nextProps.expandExercises &&
    prevProps.showVideosInline === nextProps.showVideosInline &&
    JSON.stringify(prevProps.exercises) === JSON.stringify(nextProps.exercises) &&
    JSON.stringify(prevProps.expandedExercises) === JSON.stringify(nextProps.expandedExercises)
  );
}

export const WorkoutBlock = memo(function WorkoutBlock({
  title,
  exercises = [],
  isExpanded = false,
  expandExercises = false,
  expandedExercises = {},
  setExpandedExercises,
  onToggle,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onDeleteBlock,
  onUpdateTitle,
  showVideosInline = false
}: WorkoutBlockProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [blockTitle, setBlockTitle] = useState(title);
  const [localExpandedExercises, setLocalExpandedExercises] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (expanded !== isExpanded) {
      setExpanded(isExpanded);
    }
  }, [isExpanded]);

  useEffect(() => {
    setBlockTitle(title);
  }, [title]);

  const isExerciseExpanded = useCallback((exerciseIndex: number) => {
    if (setExpandedExercises && expandedExercises) {
      const exerciseKey = `${title}-${exerciseIndex}`;
      if (exerciseKey in expandedExercises) {
        return expandedExercises[exerciseKey];
      }
      return expandExercises;
    } else {
      const exerciseKey = `${exerciseIndex}`;
      if (exerciseKey in localExpandedExercises) {
        return localExpandedExercises[exerciseKey];
      }
      return expandExercises;
    }
  }, [title, expandedExercises, expandExercises, localExpandedExercises, setExpandedExercises]);
  
  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newExpanded = !expanded;
    
    if (!newExpanded && setExpandedExercises) {
      const newExpandedExercises = { ...expandedExercises };
      exercises.forEach((_, index) => {
        delete newExpandedExercises[`${title}-${index}`];
      });
      setExpandedExercises(newExpandedExercises);
    }
    
    if (onToggle) {
      onToggle();
    } else {
      setExpanded(newExpanded);
    }
  }, [expanded, exercises, expandedExercises, onToggle, setExpandedExercises, title]);

  const toggleExerciseExpansion = useCallback((exerciseIndex: number) => {
    if (setExpandedExercises) {
      const exerciseKey = `${title}-${exerciseIndex}`;
      setExpandedExercises(prev => {
        const newExpandedExercises = { ...prev };
        newExpandedExercises[exerciseKey] = !isExerciseExpanded(exerciseIndex);
        return newExpandedExercises;
      });
    } else {
      const exerciseKey = `${exerciseIndex}`;
      setLocalExpandedExercises(prev => {
        const newLocalExpanded = { ...prev };
        newLocalExpanded[exerciseKey] = !isExerciseExpanded(exerciseIndex);
        return newLocalExpanded;
      });
    }
  }, [title, setExpandedExercises, isExerciseExpanded]);

  const handleAddExercise = useCallback(async () => {
    if (!onAddExercise) return;
    setIsLoading(true);
    try {
      await onAddExercise();
    } finally {
      setIsLoading(false);
    }
  }, [onAddExercise]);

  const handleUpdateExercise = useCallback(async (index: number, data: Partial<ExerciseType>) => {
    if (!onUpdateExercise) return;
    setIsLoading(true);
    try {
      await onUpdateExercise(index, data);
    } finally {
      setIsLoading(false);
    }
  }, [onUpdateExercise]);

  const handleDeleteExercise = useCallback(async (index: number) => {
    if (!onDeleteExercise) return;
    setIsLoading(true);
    try {
      await onDeleteExercise(index);
    } finally {
      setIsLoading(false);
    }
  }, [onDeleteExercise]);

  const handleDeleteBlock = useCallback(async () => {
    if (!onDeleteBlock) return;
    setIsLoading(true);
    try {
      await onDeleteBlock();
    } finally {
      setIsLoading(false);
    }
  }, [onDeleteBlock]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setBlockTitle(title);
  }, [title]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBlockTitle(e.target.value);
  }, []);

  const handleNameSubmit = useCallback(async () => {
    if (blockTitle.trim() && onUpdateTitle) {
      setIsLoading(true);
      try {
        await onUpdateTitle(blockTitle);
      } finally {
        setIsLoading(false);
      }
    }
    setIsEditing(false);
  }, [blockTitle, onUpdateTitle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setBlockTitle(title);
    }
  }, [handleNameSubmit, title]);

  return (
    <div className={`relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${!expanded ? 'shadow-sm' : 'shadow-md'}`}>
      {isLoading && <LoadingOverlay />}
      
      <div 
        className="flex items-center justify-between p-4 cursor-pointer border-b border-gray-200 dark:border-gray-700"
        onClick={handleToggle}
      >
        <div className="flex items-center space-x-2">
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${expanded ? 'transform rotate-180 text-blue-500 dark:text-blue-400' : ''}`} 
          />
          
          {isEditing ? (
            <input
              type="text"
              value={blockTitle}
              onChange={handleNameChange}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyDown}
              className="text-base font-medium bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-white px-1"
              autoFocus
            />
          ) : (
            <h3 
              className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onDoubleClick={handleDoubleClick}
              data-testid="block-title"
            >
              {title}
            </h3>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onAddExercise && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddExercise();
              }}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Añadir
            </button>
          )}
          
          {onDeleteBlock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBlock();
              }}
              className="p-1.5 rounded-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Eliminar bloque"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/20">
          {exercises && exercises.length > 0 ? (
            <div className="space-y-3">
              {exercises.map((exercise, exerciseIndex) => (
                <Exercise
                  key={`${exercise.id || exercise.name}-${exerciseIndex}`}
                  name={exercise.name}
                  sets={exercise.sets}
                  reps={exercise.reps}
                  weight={exercise.weight}
                  videoUrl={exercise.videoUrl}
                  notes={exercise.notes}
                  tags={exercise.tags}
                  isExpanded={isExerciseExpanded(exerciseIndex)}
                  onToggle={() => toggleExerciseExpansion(exerciseIndex)}
                  onUpdate={onUpdateExercise ? (data) => handleUpdateExercise(exerciseIndex, data) : undefined}
                  onDelete={onDeleteExercise ? () => handleDeleteExercise(exerciseIndex) : undefined}
                  showVideoInline={showVideosInline}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 mb-2">No hay ejercicios en este bloque</p>
              {onAddExercise && (
                <button
                  onClick={handleAddExercise}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir el primer ejercicio
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}, arePropsEqual);

export default WorkoutBlock; 