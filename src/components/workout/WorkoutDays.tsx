'use client';

import React, { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, ChevronDown, ChevronRight, X, ChevronUp, Video, Trash2, ArrowDownUp, Play, Pause, Settings } from 'lucide-react';
import { LoadingOverlay } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { WorkoutDay, Exercise } from '@/types/models';
import Modal from '@/components/ui/modal';
import { PlusCircle } from 'lucide-react';
import WorkoutBlock from './WorkoutBlock';
import { cn } from '@/lib/utils';
import ExerciseModal from '../modals/ExerciseModal';
import { useSession } from 'next-auth/react';

interface WorkoutDaysProps {
  days: WorkoutDay[];
  onAddDay?: () => Promise<void>;
  onAddBlock?: (dayIndex: number) => Promise<void>;
  onAddExercise?: (dayIndex: number, blockIndex: number) => Promise<void>;
  onUpdateExercise?: (dayIndex: number, blockIndex: number, exerciseIndex: number, data: Partial<Exercise>) => Promise<void>;
  onDeleteExercise?: (dayIndex: number, blockIndex: number, exerciseIndex: number) => Promise<void>;
  onDeleteBlock?: (dayIndex: number, blockIndex: number) => Promise<void>;
  onDeleteDay?: (dayIndex: number) => Promise<void>;
  onUpdateDayName: (dayIndex: number, newName: string) => void;
  onUpdateBlockName: (dayIndex: number, blockIndex: number, newName: string) => void;
  showVideosInline?: boolean;
}

type BlockKey = `${number}-${number}`;

// Memoize the WorkoutDays component to prevent unnecessary re-renders
export default memo(function WorkoutDays({ 
  days = [],
  onAddDay,
  onAddBlock,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onDeleteBlock,
  onDeleteDay,
  onUpdateDayName,
  onUpdateBlockName,
  showVideosInline = true
}: WorkoutDaysProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Record<BlockKey, boolean>>({});
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [expandExercises, setExpandExercises] = useState(false);
  const [modalDayIndex, setModalDayIndex] = useState<number | null>(null);
  const [modalBlockIndex, setModalBlockIndex] = useState<number | null>(null);
  const [modalExerciseIndex, setModalExerciseIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Estados para edición de nombres
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [dayName, setDayName] = useState('');
  
  // Handlers para edición de nombres
  const handleDayDoubleClick = (dayIndex: number, currentName: string) => {
    setEditingDayIndex(dayIndex);
    setDayName(currentName);
  };

  const handleDayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDayName(event.target.value);
  };

  const handleDayNameSubmit = (dayIndex: number) => {
    if (dayName.trim()) {
      onUpdateDayName(dayIndex, dayName);
    }
    setEditingDayIndex(null);
  };

  const handleDayNameKeyDown = (e: React.KeyboardEvent, dayIndex: number) => {
    if (e.key === 'Enter') {
      handleDayNameSubmit(dayIndex);
    } else if (e.key === 'Escape') {
      setEditingDayIndex(null);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const toggleBlock = (dayIndex: number, blockIndex: number) => {
    const blockKey = `${dayIndex}-${blockIndex}` as BlockKey;
    setExpandedBlocks(prev => {
      const newExpandedBlocks = { ...prev };
      if (newExpandedBlocks[blockKey]) {
        delete newExpandedBlocks[blockKey];
      } else {
        newExpandedBlocks[blockKey] = true;
      }
      return newExpandedBlocks;
    });
  };

  const expandAll = () => {
    const allDays = days.reduce((acc, _, index) => ({ ...acc, [index]: true }), {});
    const allBlocks = days.reduce((acc, _, dayIndex) => {
      days[dayIndex].blocks.forEach((_, blockIndex) => {
        const key = `${dayIndex}-${blockIndex}` as BlockKey;
        acc[key] = true;
      });
      return acc;
    }, {} as Record<BlockKey, boolean>);
    
    const allExercises = days.reduce((acc, _, dayIndex) => {
      days[dayIndex].blocks.forEach((block, blockIndex) => {
        if (block.exercises) {
          block.exercises.forEach((_, exerciseIndex) => {
            const exerciseKey = `${block.name}-${exerciseIndex}`;
            acc[exerciseKey] = true;
          });
        }
      });
      return acc;
    }, {} as Record<string, boolean>);
    
    setExpandedDays(allDays);
    setExpandedBlocks(allBlocks);
    setExpandedExercises(allExercises);
  };

  const collapseAll = () => {
    const allDaysCollapsed: Record<number, boolean> = {};
    const allBlocksCollapsed: Record<BlockKey, boolean> = {};
    const allExercisesCollapsed: Record<string, boolean> = {};
    
    days.forEach((day, dayIndex) => {
      day.blocks.forEach((block, blockIndex) => {
        if (block.exercises) {
          block.exercises.forEach((_, exerciseIndex) => {
            const exerciseKey = `${block.name}-${exerciseIndex}`;
            allExercisesCollapsed[exerciseKey] = false;
          });
        }
      });
    });
    
    setExpandedDays(allDaysCollapsed);
    setExpandedBlocks(allBlocksCollapsed);
    setExpandedExercises(allExercisesCollapsed);
  };

  const openModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
  };

  async function handleAddDay() {
    if (!onAddDay) return;
    setIsLoading(true);
    try {
      await onAddDay();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddBlock(dayIndex: number) {
    if (!onAddBlock) return;
    setIsLoading(true);
    try {
      await onAddBlock(dayIndex);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddExercise(dayIndex: number, blockIndex: number) {
    if (!onAddExercise) return;
    setIsLoading(true);
    try {
      await onAddExercise(dayIndex, blockIndex);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateExercise(dayIndex: number, blockIndex: number, exerciseIndex: number, data: Partial<Exercise>) {
    if (!onUpdateExercise) return;
    setIsLoading(true);
    try {
      await onUpdateExercise(dayIndex, blockIndex, exerciseIndex, data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteExercise(dayIndex: number, blockIndex: number, exerciseIndex: number) {
    if (!onDeleteExercise) return;
    setIsLoading(true);
    try {
      await onDeleteExercise(dayIndex, blockIndex, exerciseIndex);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteBlock(dayIndex: number, blockIndex: number) {
    if (!onDeleteBlock) return;
    setIsLoading(true);
    try {
      await onDeleteBlock(dayIndex, blockIndex);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteDay(dayIndex: number) {
    if (!onDeleteDay) return;
    setIsLoading(true);
    try {
      await onDeleteDay(dayIndex);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative">
      {isLoading && <LoadingOverlay />}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            Object.keys(expandedDays).length === days.length ? collapseAll() : expandAll();
          }}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          {Object.keys(expandedDays).length === days.length ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
        <Button onClick={handleAddDay} className="text-gray-900 dark:text-white">
          <Plus className="w-4 h-4 mr-2" />
          Añadir día
        </Button>
      </div>
      <div className="space-y-8">
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {editingDayIndex === dayIndex ? (
                  <input
                    type="text"
                    value={dayName}
                    onChange={handleDayNameChange}
                    onBlur={() => handleDayNameSubmit(dayIndex)}
                    onKeyDown={(e) => handleDayNameKeyDown(e, dayIndex)}
                    className="font-semibold text-lg border-b-2 border-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <h2 
                    className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200" 
                    onDoubleClick={() => handleDayDoubleClick(dayIndex, day.name)}
                  >
                    {day.name}
                  </h2>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddBlock(dayIndex)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir bloque
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDay(dayIndex)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Use WorkoutBlock component for rendering */}
            {day.blocks && day.blocks.length > 0 && !isLoading && (
              <div className="mt-4 space-y-4">
                {day.blocks.map((block, blockIndex) => {
                  const blockKey = `${dayIndex}-${blockIndex}` as BlockKey;
                  const isBlockExpanded = expandedBlocks[blockKey] || false;
                  
                  return (
                    <WorkoutBlock
                      key={blockIndex}
                      title={block.name}
                      exercises={block.exercises || []}
                      isExpanded={isBlockExpanded}
                      expandExercises={expandExercises}
                      expandedExercises={expandedExercises}
                      setExpandedExercises={setExpandedExercises}
                      onToggle={() => toggleBlock(dayIndex, blockIndex)}
                      onAddExercise={() => handleAddExercise(dayIndex, blockIndex)}
                      onUpdateExercise={(exerciseIndex, data) => 
                        handleUpdateExercise(dayIndex, blockIndex, exerciseIndex, data)
                      }
                      onDeleteExercise={(exerciseIndex) => 
                        handleDeleteExercise(dayIndex, blockIndex, exerciseIndex)
                      }
                      onUpdateTitle={(newTitle) => Promise.resolve(onUpdateBlockName(dayIndex, blockIndex, newTitle))}
                      onDeleteBlock={() => handleDeleteBlock(dayIndex, blockIndex)}
                      showVideosInline={showVideosInline}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {isModalOpen && selectedExercise && (
        <Modal onClose={closeModal}>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">{selectedExercise.name}</h2>
            {selectedExercise.videoUrl && (
              <div className="mb-4">
                <video 
                  src={selectedExercise.videoUrl} 
                  controls 
                  className="w-full rounded-lg"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Sets</p>
                <p className="font-medium">{selectedExercise.sets}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reps</p>
                <p className="font-medium">{selectedExercise.reps}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">{selectedExercise.weight || 'N/A'}</p>
              </div>
            </div>
            {selectedExercise.notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">{selectedExercise.notes}</p>
              </div>
            )}
            <Button onClick={closeModal} className="w-full">
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}); 