'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Copy, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import RenderTracker from '../RenderTracker';
import dynamic from 'next/dynamic';

import DuplicateWorkoutModal from '../modals/DuplicateWorkoutModal';
import AssignWorkoutModal from '../modals/AssignWorkoutModal';
import RenameWorkoutModal from '../modals/RenameWorkoutModal';
import DeleteWorkoutModal from '../modals/DeleteWorkoutModal';
import { duplicateWorkout, assignWorkoutToUser, updateWorkoutName, deleteWorkout } from '@/app/workout/[id]/actions';

/**
 * Performance Enhancement: Virtualized Workout List
 * 
 * We've implemented a virtualized list for the workout items to significantly improve performance:
 * 
 * 1. Window Virtualization: Only renders the items currently visible in the viewport
 * 2. Reduced DOM Nodes: Dramatically reduces the number of DOM nodes for large lists
 * 3. Smooth Scrolling: Maintains 60fps scrolling even with hundreds of workout items
 * 4. Optimized Loading: Uses ResizeObserver for responsive sizing and dynamic measurement
 * 5. Memory Optimization: Reduces memory consumption for large lists
 * 6. Adaptive: Automatically switches between virtualized and standard rendering based on list size
 * 7. Lazy Loading: Components are lazily loaded with fallback UI
 * 
 * This implementation uses @tanstack/react-virtual library with React 18 optimizations.
 */

// Dynamically import virtualized list with loading fallback for performance
const VirtualizedWorkoutListComponent = dynamic(
  () => import('./VirtualizedWorkoutList'),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    )
  }
);

interface Exercise {
  _id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
  videoUrl?: string;
}

interface Block {
  _id: string;
  name: string;
  exercises: Exercise[];
}

interface WorkoutDay {
  _id: string;
  name: string;
  blocks: Block[];
}

interface Workout {
  _id: string;
  name: string;
  description?: string;
  days: WorkoutDay[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  id?: string;
}

interface WorkoutListProps {
  workouts: Workout[];
  isCoach?: boolean;
}

// Custom equality function for memo to prevent unnecessary re-renders
function arePropsEqual(prevProps: WorkoutListProps, nextProps: WorkoutListProps) {
  // Check if isCoach changed
  if (prevProps.isCoach !== nextProps.isCoach) return false;
  
  // Check if workouts array length changed
  if (prevProps.workouts.length !== nextProps.workouts.length) return false;
  
  // Check if any workout IDs changed (shallow comparison of IDs only)
  for (let i = 0; i < prevProps.workouts.length; i++) {
    const prevId = prevProps.workouts[i].id || prevProps.workouts[i]._id;
    const nextId = nextProps.workouts[i].id || nextProps.workouts[i]._id;
    if (prevId !== nextId) return false;
  }
  
  // If we got here, props are considered equal
  return true;
}

// Memoize the entire component
const WorkoutList = memo(function WorkoutList({ workouts: initialWorkouts, isCoach = false }: WorkoutListProps) {
  const router = useRouter();
  
  // Use the initialWorkouts directly instead of copying to state
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useVirtualization, setUseVirtualization] = useState(true);

  // Memoize the workouts array to prevent unnecessary re-renders
  const workouts = useMemo(() => initialWorkouts, [initialWorkouts]);

  // Use useCallback for all functions including utility functions
  const getValidWorkoutId = useCallback((workout: Workout): string | null => {
    // Verifica si existe workout.id (formato que estamos recibiendo según los logs)
    if (workout.id && typeof workout.id === 'string' && workout.id.length > 0) {
      return workout.id;
    }
    
    // Mantén también la verificación de workout._id por si acaso
    if (workout._id && typeof workout._id === 'string' && workout._id.length > 0) {
      return workout._id;
    }
    
    return null;
  }, []);

  // Navigation callback
  const handleWorkoutClick = useCallback((workoutId: string) => {
    router.push(`/workout/${workoutId}`);
  }, [router]);

  // Format workout data for the virtualization component
  const formattedWorkouts = useMemo(() => {
    return workouts.map(workout => ({
      id: getValidWorkoutId(workout) || workout._id.toString(), 
      name: workout.name,
      days: workout.days,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt,
      // Pass additional fields needed by WorkoutItem
      isShared: false, // Update this based on your data model
      _id: workout._id,
      description: workout.description
    }));
  }, [workouts, getValidWorkoutId]);

  // Detect if list is large enough to benefit from virtualization
  useEffect(() => {
    // Enable virtualization based on list size or browser performance
    setUseVirtualization(workouts.length > 15);
  }, [workouts.length]);

  const handleDuplicateClick = useCallback((workout: Workout) => {
    setSelectedWorkout(workout);
    setShowDuplicateModal(true);
  }, []);

  const handleDuplicate = useCallback(async (newName: string, newDescription: string, workoutId: string) => {
    if (!workoutId || !newName) {
      setError('ID de rutina o nuevo nombre no definido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const duplicated = await duplicateWorkout(workoutId, newName, newDescription);
      
      // Verificar que el objeto devuelto tiene la estructura esperada
      if (!duplicated || !duplicated.id) {
        throw new Error('La respuesta del servidor no incluye información válida de la rutina');
      }
      
      // Si llegamos hasta aquí, la duplicación fue exitosa
      setShowDuplicateModal(false);
      toast.success('Rutina duplicada exitosamente');
      
      router.refresh();
    } catch (error) {
      setError('Error al duplicar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al duplicar la rutina');
      // No cerramos el modal en caso de error para permitir reintentar
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleAssignClick = useCallback((workout: Workout) => {
    setSelectedWorkout(workout);
    setShowAssignModal(true);
  }, []);

  const handleAssign = useCallback(async (data: { coachIds: string[]; customerIds: string[] }) => {
    if (!selectedWorkout) return;

    const workoutId = getValidWorkoutId(selectedWorkout);
    if (!workoutId) {
      toast.error('No se puede asignar esta rutina: ID inválido');
      return;
    }

    try {
      await assignWorkoutToUser(workoutId, data);
      
      setShowAssignModal(false);
      toast.success('Rutina asignada exitosamente');
      router.refresh();
    } catch (error) {
      setError('Error al asignar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al asignar la rutina');
    }
  }, [selectedWorkout, getValidWorkoutId, router]);

  const handleRenameClick = useCallback((workout: Workout) => {
    setSelectedWorkout(workout);
    setShowRenameModal(true);
  }, []);

  const handleRename = useCallback(async (workoutId: string, newName: string, newDescription: string) => {
    if (!workoutId || !newName) {
      setError('ID de rutina o nuevo nombre no definido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateWorkoutName(workoutId, newName, newDescription);
      
      setShowRenameModal(false);
      toast.success('Rutina renombrada exitosamente');
      
      router.refresh();
    } catch (error) {
      setError('Error al renombrar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al renombrar la rutina');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleDeleteClick = useCallback((workout: Workout) => {
    setSelectedWorkout(workout);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = useCallback(async (workoutId: string) => {
    if (!workoutId) {
      setError('ID de rutina no definido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the userId from the selected workout
      const userId = selectedWorkout?.userId || '';
      await deleteWorkout(workoutId, userId);
      
      setShowDeleteModal(false);
      toast.success('Rutina eliminada exitosamente');
      
      router.refresh();
    } catch (error) {
      setError('Error al eliminar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la rutina');
    } finally {
      setLoading(false);
    }
  }, [router, selectedWorkout]);

  return (
    <div className="relative space-y-4" data-testid="workout-list-container">
      {workouts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No tienes rutinas todavía.</p>
        </div>
      ) : useVirtualization ? (
        <VirtualizedWorkoutListComponent
          workouts={formattedWorkouts}
          isCoach={isCoach}
          onWorkoutClick={handleWorkoutClick}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {workouts.map((workout) => {
            const workoutId = getValidWorkoutId(workout);
            
            return (
              <div 
                key={workoutId || workout._id.toString()} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {workout.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {workout.days?.length || 0} {workout.days?.length === 1 ? 'día' : 'días'}
                    </p>
                    
                    {workout.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {workout.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                    {workoutId && (
                      <button
                        onClick={() => handleWorkoutClick(workoutId)}
                        className="inline-flex items-center justify-center p-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label={`Ver rutina ${workout.name}`}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRenameClick(workout)}
                      className="inline-flex items-center justify-center p-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      aria-label={`Editar rutina ${workout.name}`}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDuplicateClick(workout)}
                      className="inline-flex items-center justify-center p-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      aria-label={`Duplicar rutina ${workout.name}`}
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    
                    {isCoach && (
                      <button
                        onClick={() => handleAssignClick(workout)}
                        className="inline-flex items-center justify-center p-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-label={`Asignar rutina ${workout.name}`}
                      >
                        <Users className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteClick(workout)}
                      className="inline-flex items-center justify-center p-2 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      aria-label={`Eliminar rutina ${workout.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedWorkout && (
        <>
          <DuplicateWorkoutModal
            isOpen={showDuplicateModal}
            onClose={() => setShowDuplicateModal(false)}
            onDuplicate={handleDuplicate}
            workoutId={getValidWorkoutId(selectedWorkout) || ''}
            workoutName={selectedWorkout.name}
            workoutDescription={selectedWorkout.description || ''}
          />
          
          <AssignWorkoutModal
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            onAssign={handleAssign}
            workoutId={getValidWorkoutId(selectedWorkout) || ''}
            workoutName={selectedWorkout.name}
            workoutDescription={selectedWorkout.description || ''}
          />
          
          <RenameWorkoutModal
            isOpen={showRenameModal}
            onClose={() => setShowRenameModal(false)}
            onRename={handleRename}
            workoutId={getValidWorkoutId(selectedWorkout) || ''}
            currentName={selectedWorkout.name}
            currentDescription={selectedWorkout.description || ''}
          />
          
          <DeleteWorkoutModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onDelete={handleDelete}
            workoutId={getValidWorkoutId(selectedWorkout) || ''}
            workoutName={selectedWorkout.name}
          />
        </>
      )}
      
      <div className="absolute top-0 right-0 m-1">
        <RenderTracker componentName="WorkoutList" showCount={process.env.NODE_ENV === 'development'} />
      </div>
    </div>
  );
}, arePropsEqual);

export default WorkoutList; 