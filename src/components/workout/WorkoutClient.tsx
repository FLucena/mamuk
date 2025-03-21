'use client';

import { useState, useMemo, SetStateAction, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, Workout } from '@/types/models';
import WorkoutDetailHeader from '@/components/workout/WorkoutDetailHeader';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import WorkoutDayComponent from '@/components/workout/WorkoutDay';
import { ErrorWithMessage } from '@/types/common';

interface WorkoutClientProps {
  workout: Workout;
  addDay: (workoutId: string, userId: string) => Promise<Workout>;
  addBlock: (workout: Workout, dayIndex: number) => Promise<Workout>;
  addExercise: (workout: Workout, dayIndex: number, blockIndex: number) => Promise<Workout>;
  updateExercise: (workout: Workout, dayIndex: number, blockIndex: number, exerciseIndex: number, data: Partial<Exercise>) => Promise<Workout>;
  deleteExercise: (workout: Workout, dayIndex: number, blockIndex: number, exerciseIndex: number) => Promise<Workout>;
  deleteBlock: (workout: Workout, dayIndex: number, blockIndex: number) => Promise<Workout>;
  deleteDay: (workout: Workout, dayIndex: number) => Promise<Workout>;
  deleteWorkout: (workoutId: string, userId: string) => Promise<void>;
  updateDayName?: (workout: Workout, dayIndex: number, newName: string) => Promise<Workout>;
  updateBlockName?: (workout: Workout, dayIndex: number, blockIndex: number, newName: string) => Promise<Workout>;
  userId: string;
  showVideosInline?: boolean;
  isAdmin?: boolean;
  isCoach?: boolean;
}

interface UIState {
  expandedDays: Record<number, boolean>;
  expandedBlocks: Record<string, boolean>;
  expandedExercises: Record<string, boolean>;
  expandExercises: boolean;
  isLoading: boolean;
  isDeleting: boolean;
}

export default function WorkoutClient({
  workout: initialWorkout,
  addDay,
  addBlock,
  addExercise,
  updateExercise,
  deleteExercise,
  deleteBlock,
  deleteDay,
  deleteWorkout,
  updateDayName,
  updateBlockName,
  userId,
  showVideosInline = true,
}: WorkoutClientProps) {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout>(initialWorkout);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [uiState, setUIState] = useState<UIState>({
    expandedDays: {},
    expandedBlocks: {},
    expandedExercises: {},
    expandExercises: false,
    isLoading: false,
    isDeleting: false
  });

  // Make sure workout has proper ID when it changes
  useEffect(() => {
    if (initialWorkout.id !== workout.id || !workout.id) {
      console.log('Updating workout with new data, ID:', initialWorkout.id);
      setWorkout(initialWorkout);
    }
  }, [initialWorkout, workout.id]);

  // Log workout ID on mount for debugging
  useEffect(() => {
    console.log('WorkoutClient initialized with ID:', workout.id);
    
    // Validate the ID format
    if (!workout.id || typeof workout.id !== 'string' || workout.id.trim() === '') {
      console.error('Warning: Workout has invalid ID:', workout.id);
    }
  }, [workout.id]);

  // Helper to refresh the page data if we encounter ID issues
  const refreshWorkoutData = useCallback(() => {
    console.log('Refreshing workout data due to ID issues');
    router.refresh();
  }, [router]);

  const updateUIState = (updates: Partial<UIState>) => {
    setUIState(prev => ({ ...prev, ...updates }));
  };

  const handleAddDay = async () => {
    updateUIState({ isLoading: true });
    try {
      const workoutId = workout.id || '';
      if (!workoutId) {
        throw new Error('ID de rutina no válido');
      }
      
      const result = await addDay(workoutId, userId);
      
      // Expand the new day
      const newDayIndex = (result.days?.length || 0) - 1;
      if (newDayIndex >= 0) {
        updateUIState({
          expandedDays: {
            ...uiState.expandedDays,
            [newDayIndex]: true
          }
        });
      }
      
      toast.success('Día agregado correctamente');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error al agregar día:', error);
      const err = error as ErrorWithMessage;
      toast.error(`Error al agregar día: ${err.message || 'Error desconocido'}`);
    } finally {
      updateUIState({ isLoading: false });
    }
  };

  const handleAddBlock = async (dayIndex: number) => {
    updateUIState({ isLoading: true });
    
    try {
      // Ensure the workout object has a valid ID before sending
      if (!workout.id) {
        console.error('Workout ID is missing in the client', { workout });
        toast.error('Error: ID de rutina no disponible');
        updateUIState({ isLoading: false });
        refreshWorkoutData();
        return;
      }
      
      // Debug log to trace the workout object being sent
      console.log('Sending workout to addBlock action:', {
        id: workout.id,
        name: workout.name,
        dayCount: workout.days?.length
      });
      
      const result = await addBlock(workout, dayIndex);
      
      // Update expanded states in a single update
      const blockIndex = (result.days[dayIndex].blocks?.length || 0) - 1;
      const key = `${dayIndex}-${blockIndex}`;
      
      updateUIState({
        expandedDays: { ...uiState.expandedDays, [dayIndex]: true },
        expandedBlocks: { ...uiState.expandedBlocks, [key]: true }
      });
      
      toast.success('Bloque agregado correctamente');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error al agregar bloque:', error);
      const err = error as ErrorWithMessage;
      
      // Check for ID-related errors and refresh the page data if needed
      if (err.message?.includes('Invalid workout ID')) {
        toast.error('Error al agregar bloque: ID de rutina inválido. Refrescando datos...');
        refreshWorkoutData();
      } else {
        toast.error(`Error al agregar bloque: ${err.message || 'Error desconocido'}`);
      }
    } finally {
      updateUIState({ isLoading: false });
    }
  };

  const handleAddExercise = async (dayIndex: number, blockIndex: number) => {
    try {
      await addExercise(workout, dayIndex, blockIndex);
      toast.success('Ejercicio añadido correctamente');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error adding exercise:', error);
      toast.error('Error al añadir el ejercicio');
    }
  };

  const handleUpdateExercise = async (dayIndex: number, blockIndex: number, exerciseIndex: number, data: Partial<Exercise>) => {
    try {
      await updateExercise(workout, dayIndex, blockIndex, exerciseIndex, data);
      toast.success('Ejercicio actualizado correctamente');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error updating exercise:', error);
      toast.error('Error al actualizar el ejercicio');
    }
  };

  const handleDeleteExercise = async (dayIndex: number, blockIndex: number, exerciseIndex: number) => {
    try {
      await deleteExercise(workout, dayIndex, blockIndex, exerciseIndex);
      toast.success('Ejercicio eliminado correctamente');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error deleting exercise:', error);
      toast.error('Error al eliminar el ejercicio');
    }
  };

  const handleDeleteBlock = async (dayIndex: number, blockIndex: number) => {
    try {
      await deleteBlock(workout, dayIndex, blockIndex);
      toast.success('Bloque eliminado correctamente');
      router.refresh();
      
      // Update expanded blocks state
      const newExpandedBlocks = { ...uiState.expandedBlocks };
      Object.keys(newExpandedBlocks).forEach(key => {
        const [day, block] = key.split('-').map(Number);
        if (day === dayIndex && block >= blockIndex) {
          delete newExpandedBlocks[key];
          if (block > blockIndex) {
            newExpandedBlocks[`${day}-${block - 1}`] = true;
          }
        }
      });
      
      updateUIState({ expandedBlocks: newExpandedBlocks });
    } catch (error: unknown) {
      console.error('Error deleting block:', error);
      toast.error('Error al eliminar el bloque');
    }
  };

  const handleDeleteDay = async (dayIndex: number) => {
    try {
      await deleteDay(workout, dayIndex);
      toast.success('Día eliminado correctamente');
      router.refresh();

      // Update expanded states
      const newExpandedDays = { ...uiState.expandedDays };
      const newExpandedBlocks = { ...uiState.expandedBlocks };
      
      // Remove the deleted day from expanded days
      delete newExpandedDays[dayIndex];
      
      // Update indices for remaining days
      Object.keys(newExpandedDays).forEach(key => {
        const day = parseInt(key);
        if (day > dayIndex) {
          newExpandedDays[day - 1] = newExpandedDays[day];
          delete newExpandedDays[day];
        }
      });
      
      // Update block indices
      Object.keys(newExpandedBlocks).forEach(key => {
        const [day, block] = key.split('-').map(Number);
        if (day === dayIndex) {
          delete newExpandedBlocks[key];
        } else if (day > dayIndex) {
          delete newExpandedBlocks[key];
          newExpandedBlocks[`${day - 1}-${block}`] = true;
        }
      });
      
      updateUIState({
        expandedDays: newExpandedDays,
        expandedBlocks: newExpandedBlocks
      });
    } catch (error: unknown) {
      console.error('Error deleting day:', error);
      toast.error('Error al eliminar el día');
    }
  };

  const handleDeleteWorkout = async () => {
    if (!workout?.id) return;
    
    updateUIState({ isDeleting: true });
    
    try {
      await deleteWorkout(workout.id, userId);
      toast.success('Rutina eliminada exitosamente');
      
      // Add a small delay before redirecting to ensure the server has processed the deletion
      setTimeout(() => {
        router.replace('/workout');
      }, 300);
    } catch (error: unknown) {
      console.error('Error al eliminar la rutina:', error);
      toast.error('Error al eliminar la rutina');
      updateUIState({ isDeleting: false });
    }
  };

  const handleUpdateDayName = async (dayIndex: number, newName: string) => {
    updateUIState({ isLoading: true });
    
    try {
      if (!updateDayName) {
        throw new Error('Función de actualización no disponible');
      }
      
      await updateDayName(workout, dayIndex, newName);
      toast.success('Nombre actualizado correctamente');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error updating day name:', error);
      const err = error as ErrorWithMessage;
      toast.error(`Error al actualizar el nombre: ${err.message || 'Error desconocido'}`);
    } finally {
      updateUIState({ isLoading: false });
    }
  };

  const handleUpdateBlockName = async (dayIndex: number, blockIndex: number, newName: string) => {
    updateUIState({ isLoading: true });
    
    try {
      if (!updateBlockName) {
        throw new Error('Función de actualización no disponible');
      }
      
      await updateBlockName(workout, dayIndex, blockIndex, newName);
      toast.success('Nombre actualizado correctamente');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error updating block name:', error);
      const err = error as ErrorWithMessage;
      toast.error(`Error al actualizar el nombre: ${err.message || 'Error desconocido'}`);
    } finally {
      updateUIState({ isLoading: false });
    }
  };

  const expandAll = () => {
    // Crear nuevos objetos para los estados para evitar referencias a los anteriores
    const allDaysExpanded: Record<number, boolean> = {};
    const allBlocksExpanded: Record<string, boolean> = {};
    const allExercisesExpanded: Record<string, boolean> = {};
    
    // Llenar los objetos con los datos necesarios
    if (workout.days) {
      workout.days.forEach((day, i) => {
        allDaysExpanded[i] = true;
        
        if (day.blocks) {
          day.blocks.forEach((block, j) => {
            const blockKey = `${i}-${j}`;
            allBlocksExpanded[blockKey] = true;
            
            if (block.exercises) {
              block.exercises.forEach((_, k) => {
                const exerciseKey = `${block.name}-${k}`;
                allExercisesExpanded[exerciseKey] = true;
              });
            }
          });
        }
      });
    }
    
    // Actualizar los estados en un solo batch para evitar múltiples re-renders
    // que podrían causar loops infinitos
    const shouldUpdateDays = JSON.stringify(uiState.expandedDays) !== JSON.stringify(allDaysExpanded);
    const shouldUpdateBlocks = JSON.stringify(uiState.expandedBlocks) !== JSON.stringify(allBlocksExpanded);
    const shouldUpdateExercises = JSON.stringify(uiState.expandedExercises) !== JSON.stringify(allExercisesExpanded);
    
    // Solo actualizar si hay cambios para evitar loops infinitos
    if (shouldUpdateDays) {
      updateUIState({ expandedDays: allDaysExpanded });
    }
    
    if (shouldUpdateBlocks) {
      updateUIState({ expandedBlocks: allBlocksExpanded });
    }
    
    if (shouldUpdateExercises) {
      updateUIState({ expandedExercises: allExercisesExpanded });
    }
  };

  const collapseAll = () => {
    // Crear nuevos objetos para los estados para evitar referencias a los anteriores
    const allDaysCollapsed: Record<number, boolean> = {};
    const allBlocksCollapsed: Record<string, boolean> = {};
    const allExercisesCollapsed: Record<string, boolean> = {};
    
    // No es necesario iterar por los elementos ya que estamos colapsando todo
    
    // Actualizar los estados
    updateUIState({
      expandedDays: allDaysCollapsed,
      expandedBlocks: allBlocksCollapsed,
      expandedExercises: allExercisesCollapsed
    });
  };

  return (
    <div className="pb-10">
      {workout ? (
        <>
          <WorkoutDetailHeader
            name={workout.name}
            description={workout.description}
          />
          
          <div className="container max-w-5xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-md transition-colors"
                >
                  Expandir todo
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Colapsar todo
                </button>
              </div>
              
              <button
                onClick={handleDeleteWorkout}
                className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-md transition-colors flex items-center"
                aria-label="Eliminar rutina"
                disabled={uiState.isDeleting}
              >
                <Trash className="w-4 h-4 mr-1.5" />
                Eliminar
              </button>
            </div>
            
            {workout.days && workout.days.length > 0 ? (
              <div className="space-y-6">
                {workout.days.map((day, dayIndex) => (
                  <WorkoutDayComponent
                    key={`day-${dayIndex}-${day.id || day.name}`}
                    title={day.name}
                    blocks={day.blocks || []}
                    isExpanded={!!uiState.expandedDays[dayIndex]}
                    expandExercises={uiState.expandExercises}
                    expandedBlocks={uiState.expandedBlocks}
                    setExpandedBlocks={(value: SetStateAction<Record<string, boolean>>) => {
                      if (typeof value === 'function') {
                        updateUIState({ expandedBlocks: value(uiState.expandedBlocks) });
                      } else {
                        updateUIState({ expandedBlocks: value });
                      }
                    }}
                    expandedExercises={uiState.expandedExercises}
                    setExpandedExercises={(value: SetStateAction<Record<string, boolean>>) => {
                      if (typeof value === 'function') {
                        updateUIState({ expandedExercises: value(uiState.expandedExercises) });
                      } else {
                        updateUIState({ expandedExercises: value });
                      }
                    }}
                    dayIndex={dayIndex}
                    onAddBlock={addBlock ? () => handleAddBlock(dayIndex) : undefined}
                    onAddExercise={addExercise ? (blockIndex) => handleAddExercise(dayIndex, blockIndex) : undefined}
                    onUpdateExercise={updateExercise ? (blockIndex, exerciseIndex, data) => handleUpdateExercise(dayIndex, blockIndex, exerciseIndex, data) : undefined}
                    onDeleteExercise={deleteExercise ? (blockIndex, exerciseIndex) => handleDeleteExercise(dayIndex, blockIndex, exerciseIndex) : undefined}
                    onUpdateTitle={updateDayName ? (newName) => handleUpdateDayName(dayIndex, newName) : undefined}
                    onUpdateBlockTitle={updateBlockName ? (blockIndex, newName) => handleUpdateBlockName(dayIndex, blockIndex, newName) : undefined}
                    onDeleteBlock={deleteBlock ? (blockIndex) => handleDeleteBlock(dayIndex, blockIndex) : undefined}
                    onDeleteDay={deleteDay ? () => handleDeleteDay(dayIndex) : undefined}
                    showVideosInline={showVideosInline}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">No hay días en esta rutina</p>
                {addDay && (
                  <button
                    onClick={() => handleAddDay()}
                    className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm"
                    disabled={uiState.isLoading}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Añadir primer día
                  </button>
                )}
              </div>
            )}
            
            {workout.days && workout.days.length > 0 && addDay && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => handleAddDay()}
                  className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm"
                  disabled={uiState.isLoading}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Añadir día
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="container max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">No se encontró la rutina</p>
          <Link 
            href="/workout" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Volver a rutinas
          </Link>
        </div>
      )}
    </div>
  );
}