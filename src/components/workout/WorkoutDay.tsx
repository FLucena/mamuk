'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
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
}

export default function WorkoutDay({ 
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
        // Si estamos colapsando el día, colapsamos todos sus bloques y ejercicios
        if (setExpandedBlocks) {
          const newExpandedBlocks = { ...expandedBlocks };
          blocks.forEach((_, index) => {
            delete newExpandedBlocks[`${dayIndex}-${index}`];
          });
          setExpandedBlocks(newExpandedBlocks);
        }
        
        if (setExpandedExercises) {
          const newExpandedExercises = { ...expandedExercises };
          blocks.forEach((block) => {
            block.exercises?.forEach((_, exerciseIndex) => {
              delete newExpandedExercises[`${block.name}-${exerciseIndex}`];
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
          delete newExpandedExercises[`${block.name}-${exerciseIndex}`];
        });
        setExpandedExercises(newExpandedExercises);
      }
    }
  };

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 transition-all duration-200 ${!expanded ? 'shadow-sm' : 'shadow-md'}`}>
      {isLoading && <LoadingOverlay />}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={handleToggle}
            className="flex items-center mr-2 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            aria-expanded={expanded}
            aria-label={expanded ? "Colapsar día" : "Expandir día"}
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'transform rotate-180' : ''}`} />
          </button>
          
          {isEditing ? (
            <input
              type="text"
              value={dayTitle}
              onChange={handleNameChange}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyDown}
              className="text-xl font-medium border-b-2 border-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white"
              autoFocus
            />
          ) : (
            <h2 
              className="text-xl font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              onDoubleClick={handleDoubleClick}
            >
              {title}
            </h2>
          )}
        </div>

        <div className="flex space-x-2">
          {onAddBlock && (
            <button
              onClick={handleAddBlock}
              className="flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Añadir bloque
            </button>
          )}
          
          {onDeleteDay && (
            <button
              onClick={handleDeleteDay}
              className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded transition-colors"
              title="Eliminar día"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {expanded && blocks.length > 0 && (
        <div className="space-y-6">
          {blocks.map((block, blockIndex) => (
            <WorkoutBlock
              key={block.id || blockIndex}
              title={block.name}
              exercises={block.exercises || []}
              isExpanded={isBlockExpanded(blockIndex)}
              expandExercises={expandExercises}
              expandedExercises={expandedExercises}
              setExpandedExercises={setExpandedExercises}
              onToggle={() => toggleBlockExpansion(blockIndex)}
              onAddExercise={onAddExercise ? () => handleAddExercise(blockIndex) : undefined}
              onUpdateExercise={(exerciseIndex, data) => handleUpdateExercise(blockIndex, exerciseIndex, data)}
              onDeleteExercise={onDeleteExercise ? (exerciseIndex) => handleDeleteExercise(blockIndex, exerciseIndex) : undefined}
              onUpdateTitle={onUpdateBlockTitle ? (newTitle) => handleUpdateBlockTitle(blockIndex, newTitle) : undefined}
              onDeleteBlock={onDeleteBlock ? () => handleDeleteBlock(blockIndex) : undefined}
            />
          ))}
        </div>
      )}

      {expanded && blocks.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-6">
          No hay bloques en este día
        </p>
      )}
    </div>
  );
}