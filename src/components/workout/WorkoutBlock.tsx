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
    <div className={`relative bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 transition-all duration-200 ${!expanded ? 'shadow-sm' : 'shadow-md'}`}>
      {isLoading && <LoadingOverlay />}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={handleToggle}
            className="flex items-center mr-2 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            aria-expanded={expanded}
            aria-label={expanded ? "Colapsar bloque" : "Expandir bloque"}
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'transform rotate-180' : ''}`} />
          </button>
          
          {isEditing ? (
            <input
              type="text"
              value={blockTitle}
              onChange={handleNameChange}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyDown}
              className="text-lg font-medium border-b-2 border-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white"
              autoFocus
            />
          ) : (
            <h3 
              className="text-lg font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              onDoubleClick={handleDoubleClick}
              data-testid="block-title"
            >
              {title}
            </h3>
          )}
        </div>

        <div className="flex space-x-2">
          {onAddExercise && (
            <button
              onClick={handleAddExercise}
              className="flex items-center px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Añadir ejercicio
            </button>
          )}
          
          {onDeleteBlock && (
            <button
              onClick={handleDeleteBlock}
              className="flex items-center px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded transition-colors"
              title="Eliminar bloque"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden list of exercises for testing purposes */}
      <div className="sr-only" data-testid="exercise-list">
        {exercises.map((exercise, index) => (
          <div key={index} data-testid={`exercise-item-${index}`}>
            {exercise.name}
          </div>
        ))}
      </div>

      {expanded && (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
          {exercises.length > 0 ? (
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <Exercise
                  key={exercise.id || `${title}-${index}`}
                  name={exercise.name}
                  sets={exercise.sets}
                  reps={exercise.reps}
                  weight={exercise.weight}
                  videoUrl={exercise.videoUrl}
                  notes={exercise.notes}
                  tags={exercise.tags}
                  isExpanded={isExerciseExpanded(index)}
                  onToggle={() => toggleExerciseExpansion(index)}
                  onUpdate={(data) => handleUpdateExercise(index, data)}
                  onDelete={() => handleDeleteExercise(index)}
                  showVideoInline={showVideosInline}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay ejercicios en este bloque
            </p>
          )}
        </div>
      )}
    </div>
  );
}, arePropsEqual);

export default WorkoutBlock; 