'use client';

import { useState, useEffect, useMemo, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutDay, Exercise, Workout } from '@/types/models';
import WorkoutDetailHeader from '@/components/workout/WorkoutDetailHeader';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import WorkoutDayComponent from '@/components/workout/WorkoutDay';

/**
 * Hook personalizado para obtener los roles reales del usuario desde la API
 */
function useRealUserRoles() {
  const { data: session } = useSession();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRoles() {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        // Endpoint que consultará los roles del usuario en la base de datos
        const response = await fetch(`/api/users/role?email=${encodeURIComponent(session.user.email)}`);
        
        if (response.ok) {
          const data = await response.json();
          // La API devuelve { roles } directamente
          setRoles(Array.isArray(data.roles) ? data.roles : []);
        } else {
          // Fallback a los roles de la sesión si no podemos obtener los roles actualizados
          setRoles(session.user.roles || []);
        }
      } catch (error) {
        // Fallback a los roles de la sesión
        setRoles(session.user.roles || []);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRoles();
  }, [session]);

  return { roles, loading };
}

interface WorkoutClientProps {
  workout: Workout;
  addDay: (workoutId: string, userId: string) => Promise<any>;
  addBlock: (workout: Workout, dayIndex: number) => Promise<any>;
  addExercise: (workout: Workout, dayIndex: number, blockIndex: number) => Promise<any>;
  updateExercise: (workout: Workout, dayIndex: number, blockIndex: number, exerciseIndex: number, data: Partial<Exercise>) => Promise<any>;
  deleteExercise: (workout: Workout, dayIndex: number, blockIndex: number, exerciseIndex: number) => Promise<any>;
  deleteBlock: (workout: Workout, dayIndex: number, blockIndex: number) => Promise<any>;
  deleteDay: (workout: Workout, dayIndex: number) => Promise<any>;
  deleteWorkout: (workoutId: string, userId: string) => Promise<any>;
  updateDayName?: (workout: Workout, dayIndex: number, newName: string) => Promise<any>;
  updateBlockName?: (workout: Workout, dayIndex: number, blockIndex: number, newName: string) => Promise<any>;
  userId: string;
  showVideosInline?: boolean;
  isAdmin: boolean;
  isCoach: boolean;
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
  isAdmin,
  isCoach
}: WorkoutClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { roles: userRoles, loading: rolesLoading } = useRealUserRoles();
  
  // Use a single state object for UI state to reduce re-renders
  const [uiState, setUiState] = useState<UIState>({
    expandedDays: {},
    expandedBlocks: {},
    expandedExercises: {},
    expandExercises: false,
    isLoading: false,
    isDeleting: false
  });

  // Use useMemo for workout data to prevent unnecessary re-renders
  const workout = useMemo(() => initialWorkout, [initialWorkout]);

  // Helper function to update UI state
  const updateUIState = (updates: Partial<UIState>) => {
    setUiState(prev => ({ ...prev, ...updates }));
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
    } catch (error: any) {
      console.error('Error al agregar día:', error);
      toast.error(`Error al agregar día: ${error.message || 'Error desconocido'}`);
    } finally {
      updateUIState({ isLoading: false });
    }
  };

  const handleAddBlock = async (dayIndex: number) => {
    updateUIState({ isLoading: true });
    
    try {
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
    } catch (error: any) {
      console.error('Error al agregar bloque:', error);
      toast.error(error.message || 'Error al agregar bloque');
    } finally {
      updateUIState({ isLoading: false });
    }
  };

  const handleAddExercise = async (dayIndex: number, blockIndex: number) => {
    try {
      const result = await addExercise(workout, dayIndex, blockIndex);
      toast.success('Ejercicio añadido correctamente');
      router.refresh();
    } catch (error) {
      console.error('Error adding exercise:', error);
      toast.error('Error al añadir el ejercicio');
    }
  };

  const handleUpdateExercise = async (dayIndex: number, blockIndex: number, exerciseIndex: number, data: any) => {
    try {
      const result = await updateExercise(workout, dayIndex, blockIndex, exerciseIndex, data);
      toast.success('Ejercicio actualizado correctamente');
      router.refresh();
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast.error('Error al actualizar el ejercicio');
    }
  };

  const handleDeleteExercise = async (dayIndex: number, blockIndex: number, exerciseIndex: number) => {
    try {
      const result = await deleteExercise(workout, dayIndex, blockIndex, exerciseIndex);
      toast.success('Ejercicio eliminado correctamente');
      router.refresh();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error('Error al eliminar el ejercicio');
    }
  };

  const handleDeleteBlock = async (dayIndex: number, blockIndex: number) => {
    try {
      const result = await deleteBlock(workout, dayIndex, blockIndex);
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
    } catch (error) {
      console.error('Error deleting block:', error);
      toast.error('Error al eliminar el bloque');
    }
  };

  const handleDeleteDay = async (dayIndex: number) => {
    try {
      const result = await deleteDay(workout, dayIndex);
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
    } catch (error) {
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
      router.replace('/workout');
    } catch (error) {
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
    } catch (error: any) {
      console.error('Error updating day name:', error);
      toast.error(`Error al actualizar el nombre: ${error.message || 'Error desconocido'}`);
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
    } catch (error: any) {
      console.error('Error updating block name:', error);
      toast.error(`Error al actualizar el nombre: ${error.message || 'Error desconocido'}`);
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
      workout.days.forEach((day, dayIndex) => {
        allDaysExpanded[dayIndex] = true;
        
        if (day.blocks) {
          day.blocks.forEach((block, blockIndex) => {
            const blockKey = `${dayIndex}-${blockIndex}`;
            allBlocksExpanded[blockKey] = true;
            
            if (block.exercises) {
              block.exercises.forEach((_, exerciseIndex) => {
                const exerciseKey = `${block.name}-${exerciseIndex}`;
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
    
    // Llenar los objetos con los datos necesarios
    if (workout.days) {
      workout.days.forEach((day, dayIndex) => {
        // No establecemos nada para los días, lo que equivale a colapsado
        
        if (day.blocks) {
          day.blocks.forEach((block, blockIndex) => {
            // No establecemos nada para los bloques, lo que equivale a colapsado
            
            if (block.exercises) {
              block.exercises.forEach((_, exerciseIndex) => {
                const exerciseKey = `${block.name}-${exerciseIndex}`;
                allExercisesCollapsed[exerciseKey] = false; // Explícitamente colapsado
              });
            }
          });
        }
      });
    }
    
    // Actualizar los estados
    updateUIState({
      expandedDays: allDaysCollapsed,
      expandedBlocks: allBlocksCollapsed,
      expandedExercises: allExercisesCollapsed
    });
    
    // Ya no necesitamos este estado global
    // if (expandExercises) {
    //   setExpandExercises(false);
    // }
  };

  return (
    <div className="pb-10">
      {workout ? (
        <>
          <WorkoutDetailHeader
            name={workout.name}
            description={workout.description}
          />
          
          <div className="container max-w-5xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <Link 
                href="/workout" 
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Volver a rutinas
              </Link>
              
              <div className="flex space-x-2">
                <button
                  onClick={expandAll}
                  className="px-3 py-1 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded transition-colors"
                >
                  Expandir todo
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  Colapsar todo
                </button>
              </div>
            </div>
            
            {workout.days && workout.days.length > 0 ? (
              <>
                {workout.days.map((day, dayIndex) => (
                  <WorkoutDayComponent
                    key={`day-${dayIndex}-${day.name}`}
                    title={day.name}
                    blocks={day.blocks || []}
                    isExpanded={uiState.expandedDays[dayIndex] || false}
                    expandExercises={uiState.expandExercises}
                    expandedBlocks={uiState.expandedBlocks}
                    setExpandedBlocks={(value: SetStateAction<Record<string, boolean>>) => {
                      if (typeof value === 'function') {
                        setUiState(prev => ({ ...prev, expandedBlocks: value(prev.expandedBlocks) }));
                      } else {
                        setUiState(prev => ({ ...prev, expandedBlocks: value }));
                      }
                    }}
                    expandedExercises={uiState.expandedExercises}
                    setExpandedExercises={(value: SetStateAction<Record<string, boolean>>) => {
                      if (typeof value === 'function') {
                        setUiState(prev => ({ ...prev, expandedExercises: value(prev.expandedExercises) }));
                      } else {
                        setUiState(prev => ({ ...prev, expandedExercises: value }));
                      }
                    }}
                    dayIndex={dayIndex}
                    onAddBlock={() => handleAddBlock(dayIndex)}
                    onAddExercise={(blockIndex) => handleAddExercise(dayIndex, blockIndex)}
                    onUpdateExercise={(blockIndex, exerciseIndex, data) => 
                      handleUpdateExercise(dayIndex, blockIndex, exerciseIndex, data)
                    }
                    onDeleteExercise={(blockIndex, exerciseIndex) => 
                      handleDeleteExercise(dayIndex, blockIndex, exerciseIndex)
                    }
                    onUpdateTitle={(newName) => handleUpdateDayName(dayIndex, newName)}
                    onUpdateBlockTitle={(blockIndex, newName) => handleUpdateBlockName(dayIndex, blockIndex, newName)}
                    onDeleteBlock={(blockIndex) => handleDeleteBlock(dayIndex, blockIndex)}
                    onDeleteDay={() => handleDeleteDay(dayIndex)}
                    showVideosInline={showVideosInline}
                  />
                ))}
                
                {/* Botón "Añadir día" después de los días existentes */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
                  <button 
                    onClick={handleAddDay}
                    className="w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-500 dark:text-blue-400 rounded-lg flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Añadir día
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No hay días en esta rutina</p>
                <button 
                  onClick={handleAddDay}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Añadir primer día
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar la rutina</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No se pudo cargar la información de la rutina.</p>
          <Link 
            href="/workout" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Volver a rutinas
          </Link>
        </div>
      )}
    </div>
  );
} 