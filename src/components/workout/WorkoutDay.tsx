'use client';

import { useState, useEffect, Dispatch, SetStateAction, memo } from 'react';
import { ChevronDown, Plus, Trash } from 'lucide-react';
import WorkoutBlock from './WorkoutBlock';
import { LoadingOverlay } from '@/components/ui/loading';
import { Block, Exercise } from '@/types/models';

interface WorkoutDayProps {
  title: string;
  blocks: Block[];
  isExpanded?: boolean;
  expandExercises?: boolean;
  expandedBlocks?: Record<string, boolean>;
  setExpandedBlocks?: Dispatch<SetStateAction<Record<string, boolean>>>;
  expandedExercises?: Record<string, boolean>;
  setExpandedExercises?: Dispatch<SetStateAction<Record<string, boolean>>>;
  dayIndex?: number;
  onAddBlock?: () => Promise<void>;
  onAddExercise?: (blockIndex: number) => Promise<void>;
  onUpdateExercise?: (blockIndex: number, exerciseIndex: number, data: Partial<Exercise>) => Promise<void>;
  onDeleteExercise?: (blockIndex: number, exerciseIndex: number) => Promise<void>;
  onUpdateTitle?: (newTitle: string) => Promise<void>;
  onUpdateBlockTitle?: (blockIndex: number, newTitle: string) => Promise<void>;
  onDeleteBlock?: (blockIndex: number) => Promise<void>;
  onDeleteDay?: () => Promise<void>;
  showVideosInline?: boolean;
}

// Memoize the WorkoutDay component to prevent unnecessary re-renders
export default memo(function WorkoutDay({ 
  title, 
  blocks,
  isExpanded = false,
  expandExercises = false,
  expandedBlocks = {},
  setExpandedBlocks,
  expandedExercises = {},
  setExpandedExercises,
  dayIndex = 0,
  onAddBlock,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onUpdateTitle,
  onUpdateBlockTitle,
  onDeleteBlock,
  onDeleteDay,
  showVideosInline = true
}: WorkoutDayProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dayTitle, setDayTitle] = useState(title);

  useEffect(() => {
    if (expanded !== isExpanded) {
      setExpanded(isExpanded);
    }
  }, [isExpanded]);

  async function handleAddBlock() {
    if (!onAddBlock) return;
    setIsLoading(true);
    try {
      await onAddBlock();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddExercise(blockIndex: number) {
    if (!onAddExercise) return;
    setIsLoading(true);
    try {
      await onAddExercise(blockIndex);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateExercise(blockIndex: number, exerciseIndex: number, data: Partial<Exercise>) {
    if (!onUpdateExercise) return;
    setIsLoading(true);
    try {
      await onUpdateExercise(blockIndex, exerciseIndex, data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteExercise(blockIndex: number, exerciseIndex: number) {
    if (!onDeleteExercise) return;
    setIsLoading(true);
    try {
      await onDeleteExercise(blockIndex, exerciseIndex);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteBlock(blockIndex: number) {
    if (!onDeleteBlock) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este bloque?')) return;
    
    setIsLoading(true);
    try {
      await onDeleteBlock(blockIndex);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteDay() {
    if (!onDeleteDay) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este día completo?')) return;
    
    setIsLoading(true);
    try {
      await onDeleteDay();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateBlockTitle(blockIndex: number, newTitle: string) {
    if (!onUpdateBlockTitle) return;
    setIsLoading(true);
    try {
      await onUpdateBlockTitle(blockIndex, newTitle);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDoubleClick = () => {
    setIsEditing(true);
    setDayTitle(title);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDayTitle(e.target.value);
  };

  const handleNameSubmit = async () => {
    if (dayTitle.trim() && onUpdateTitle) {
      setIsLoading(true);
      try {
        await onUpdateTitle(dayTitle);
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
      setDayTitle(title);
    }
  };

  const isBlockExpanded = (blockIndex: number) => {
    if (!expandedBlocks || dayIndex === undefined) return false;
    const key = `${dayIndex}-${blockIndex}`;
    return !!expandedBlocks[key];
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setExpanded(prevExpanded => {
      const newExpanded = !prevExpanded;
      if (!newExpanded) {
        // Si estamos colapsando el día, colapsamos todos sus bloques
        if (setExpandedBlocks) {
          const newExpandedBlocks = { ...expandedBlocks };
          blocks.forEach((_, index) => {
            delete newExpandedBlocks[`${dayIndex}-${index}`];
          });
          setExpandedBlocks(newExpandedBlocks);
        }
        
        // Si estamos colapsando el día, colapsamos todos sus ejercicios
        if (setExpandedExercises) {
          const newExpandedExercises = { ...expandedExercises };
          blocks.forEach((block) => {
            block.exercises?.forEach((_, exerciseIndex) => {
              const exerciseKey = `${block.name}-${exerciseIndex}`;
              newExpandedExercises[exerciseKey] = false; // Explícitamente colapsado
            });
          });
          setExpandedExercises(newExpandedExercises);
        }
      }
      return newExpanded;
    });
  };

  const toggleBlockExpansion = (blockIndex: number) => {
    if (!setExpandedBlocks) return;
    
    const blockKey = `${dayIndex}-${blockIndex}`;
    const isCurrentlyExpanded = expandedBlocks[blockKey];
    
    // Actualizar estado de expansión del bloque
    setExpandedBlocks(prev => {
      const newExpandedBlocks = { ...prev };
      if (isCurrentlyExpanded) {
        delete newExpandedBlocks[blockKey];
      } else {
        newExpandedBlocks[blockKey] = true;
      }
      return newExpandedBlocks;
    });
    
    // Si estamos colapsando un bloque, colapsamos todos sus ejercicios
    if (isCurrentlyExpanded && setExpandedExercises) {
      const block = blocks[blockIndex];
      if (block && block.exercises) {
        const newExpandedExercises = { ...expandedExercises };
        block.exercises.forEach((_, exerciseIndex) => {
          const exerciseKey = `${block.name}-${exerciseIndex}`;
          newExpandedExercises[exerciseKey] = false; // Explícitamente colapsado
        });
        setExpandedExercises(newExpandedExercises);
      }
    }
  };

  return (
    <div className="relative">
      {isLoading && <LoadingOverlay />}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          {isEditing ? (
            <div className="flex-1">
              <input
                type="text"
                value={dayTitle}
                onChange={handleNameChange}
                onBlur={handleNameSubmit}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>
          ) : (
            <h2 
              className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer"
              onDoubleClick={handleDoubleClick}
            >
              {title}
            </h2>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggle}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse day" : "Expand day"}
            >
              <ChevronDown 
                className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${expanded ? 'transform rotate-180' : ''}`} 
              />
            </button>
            
            {onDeleteDay && (
              <button
                onClick={handleDeleteDay}
                className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                aria-label="Delete day"
              >
                <Trash className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        {expanded && (
          <div className="space-y-6">
            {blocks.map((block, blockIndex) => (
              <WorkoutBlock
                key={blockIndex}
                title={block.name}
                exercises={block.exercises}
                isExpanded={isBlockExpanded(blockIndex)}
                expandExercises={expandExercises}
                expandedExercises={expandedExercises}
                setExpandedExercises={setExpandedExercises}
                onToggle={() => toggleBlockExpansion(blockIndex)}
                onAddExercise={onAddExercise ? () => handleAddExercise(blockIndex) : undefined}
                onUpdateExercise={(exerciseIndex, data) => handleUpdateExercise(blockIndex, exerciseIndex, data)}
                onDeleteExercise={(exerciseIndex) => handleDeleteExercise(blockIndex, exerciseIndex)}
                onDeleteBlock={() => handleDeleteBlock(blockIndex)}
                onUpdateTitle={(newTitle) => handleUpdateBlockTitle(blockIndex, newTitle)}
                showVideosInline={showVideosInline}
              />
            ))}
            
            {onAddBlock && (
              <button
                onClick={handleAddBlock}
                className="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Añadir bloque
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});