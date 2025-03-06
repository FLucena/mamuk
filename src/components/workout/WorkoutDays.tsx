'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, X, ChevronUp, Video } from 'lucide-react';
import { LoadingOverlay } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { DiaRutina, Exercise } from '@/types/models';
import Modal from '@/components/ui/modal';
import { PlusCircle, Trash2 } from 'lucide-react';
import WorkoutBlock from './WorkoutBlock';
import { cn } from '@/lib/utils';
import ExerciseModal from '../modals/ExerciseModal';

interface WorkoutDaysProps {
  days: DiaRutina[];
  onAddDay?: () => Promise<void>;
  onAddBlock?: (dayIndex: number) => Promise<void>;
  onAddExercise?: (dayIndex: number, blockIndex: number) => Promise<void>;
  onUpdateExercise?: (dayIndex: number, blockIndex: number, exerciseIndex: number, data: Partial<Exercise>) => Promise<void>;
  onDeleteExercise?: (dayIndex: number, blockIndex: number, exerciseIndex: number) => Promise<void>;
  onDeleteBlock?: (dayIndex: number, blockIndex: number) => Promise<void>;
  onDeleteDay?: (dayIndex: number) => Promise<void>;
  onUpdateDayName: (dayIndex: number, newName: string) => void;
  onUpdateBlockName: (dayIndex: number, blockIndex: number, newName: string) => void;
}

type BlockKey = `${number}-${number}`;

export default function WorkoutDays({ 
  days = [],
  onAddDay,
  onAddBlock,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onDeleteBlock,
  onDeleteDay,
  onUpdateDayName,
  onUpdateBlockName
}: WorkoutDaysProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  const [modalDayIndex, setModalDayIndex] = useState<number | null>(null);
  const [modalBlockIndex, setModalBlockIndex] = useState<number | null>(null);
  const [modalExerciseIndex, setModalExerciseIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Estados para edición de nombres
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editingDayName, setEditingDayName] = useState<string>('');
  
  // Handlers para edición de nombres
  const handleDayDoubleClick = (dayIndex: number, currentName: string) => {
    setEditingDay(dayIndex);
    setEditingDayName(currentName);
  };

  const handleDayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingDayName(event.target.value);
  };

  const handleDayNameSubmit = (dayIndex: number) => {
    if (editingDayName.trim()) {
      onUpdateDayName(dayIndex, editingDayName);
    }
    setEditingDay(null);
  };

  const handleDayNameKeyDown = (e: React.KeyboardEvent, dayIndex: number) => {
    if (e.key === 'Enter') {
      handleDayNameSubmit(dayIndex);
    } else if (e.key === 'Escape') {
      setEditingDay(null);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const toggleBlock = (dayIndex: number, blockIndex: number) => {
    const key = `${dayIndex}-${blockIndex}`;
    setExpandedBlocks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
    setExpandedDays(allDays);
    setExpandedBlocks(allBlocks);
  };

  const collapseAll = () => {
    setExpandedDays({});
    setExpandedBlocks({});
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
          Agregar día
        </Button>
      </div>
      <div className="space-y-8">
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {editingDay === dayIndex ? (
                  <input
                    type="text"
                    value={editingDayName}
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
                  Agregar bloque
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
            {expandedDays[dayIndex] && (
              <div className="space-y-6">
                {day.blocks.map((block, blockIndex) => (
                  <WorkoutBlock 
                    key={blockIndex}
                    block={block}
                    dayIndex={dayIndex}
                    blockIndex={blockIndex}
                    expanded={expandedBlocks[`${dayIndex}-${blockIndex}`] || false}
                    onToggle={() => toggleBlock(dayIndex, blockIndex)}
                    onAddExercise={onAddExercise}
                    onUpdateExercise={(exerciseIndex, data) => {
                      if (onUpdateExercise) {
                        onUpdateExercise(dayIndex, blockIndex, exerciseIndex, data);
                      }
                    }}
                    onDeleteExercise={(exerciseIndex) => {
                      if (onDeleteExercise) {
                        onDeleteExercise(dayIndex, blockIndex, exerciseIndex);
                      }
                    }}
                    onDeleteBlock={() => {
                      if (onDeleteBlock) {
                        onDeleteBlock(dayIndex, blockIndex);
                      }
                    }}
                    onEditExercise={(exerciseIndex) => {
                      setModalDayIndex(dayIndex);
                      setModalBlockIndex(blockIndex);
                      setModalExerciseIndex(exerciseIndex);
                      setSelectedExercise(block.exercises[exerciseIndex]);
                      setIsModalOpen(true);
                    }}
                    onUpdateBlockName={(newName) => {
                      onUpdateBlockName(dayIndex, blockIndex, newName);
                    }}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {isModalOpen && selectedExercise && (
        <Modal onClose={closeModal}>
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{selectedExercise.name}</h2>
            <video controls className="w-full mb-4">
              <source src={selectedExercise.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedExercise.notes}</p>
          </div>
        </Modal>
      )}
    </div>
  );
} 