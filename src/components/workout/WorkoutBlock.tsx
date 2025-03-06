'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
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
}

export default function WorkoutBlock({ 
  title, 
  exercises,
  isExpanded = false,
  expandExercises = false,
  expandedExercises = {},
  setExpandedExercises,
  onToggle,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onUpdateTitle,
  onDeleteBlock,
}: WorkoutBlockProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [blockTitle, setBlockTitle] = useState(title);

  useEffect(() => {
    if (expanded !== isExpanded) {
      setExpanded(isExpanded);
    }
  }, [isExpanded, expanded]);
  
  const handleToggle = (e: React.MouseEvent) => {
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
  };

  const toggleExerciseExpansion = (exerciseIndex: number) => {
    if (!setExpandedExercises) return;
    
    const exerciseKey = `${title}-${exerciseIndex}`;
    setExpandedExercises(prev => {
      const newExpandedExercises = { ...prev };
      if (newExpandedExercises[exerciseKey]) {
        delete newExpandedExercises[exerciseKey];
      } else {
        newExpandedExercises[exerciseKey] = true;
      }
      return newExpandedExercises;
    });
  };

  const isExerciseExpanded = (exerciseIndex: number) => {
    if (!expandedExercises) return expandExercises;
    const exerciseKey = `${title}-${exerciseIndex}`;
    return expandedExercises[exerciseKey] ?? expandExercises;
  };

  async function handleAddExercise() {
    if (!onAddExercise) return;
    setIsLoading(true);
    try {
      await onAddExercise();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateExercise(index: number, data: Partial<ExerciseType>) {
    if (!onUpdateExercise) return;
    setIsLoading(true);
    try {
      await onUpdateExercise(index, data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteExercise(index: number) {
    if (!onDeleteExercise) return;
    setIsLoading(true);
    try {
      await onDeleteExercise(index);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteBlock() {
    if (!onDeleteBlock) return;
    setIsLoading(true);
    try {
      await onDeleteBlock();
    } finally {
      setIsLoading(false);
    }
  }

  const handleDoubleClick = () => {
    setIsEditing(true);
    setBlockTitle(title);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlockTitle(e.target.value);
  };

  const handleNameSubmit = async () => {
    if (blockTitle.trim() && onUpdateTitle) {
      setIsLoading(true);
      try {
        await onUpdateTitle(blockTitle);
      } finally {
        setIsLoading(false);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setBlockTitle(title);
    }
  };

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
} 