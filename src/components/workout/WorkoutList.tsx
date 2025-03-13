'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Copy, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import RenderTracker from '../RenderTracker';

import DuplicateWorkoutModal from '../modals/DuplicateWorkoutModal';
import AssignWorkoutModal from '../modals/AssignWorkoutModal';
import RenameWorkoutModal from '../modals/RenameWorkoutModal';
import DeleteWorkoutModal from '../modals/DeleteWorkoutModal';
import { duplicateWorkout, assignWorkoutToUser, updateWorkoutName, deleteWorkout } from '@/app/workout/[id]/actions';

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
  // Removed console.log
  
  const router = useRouter();
  
  // Use the initialWorkouts directly instead of copying to state
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    
    // Si llegamos aquí, no hay un ID válido
    return null;
  }, []);

  const handleDuplicateClick = useCallback((workout: Workout) => {
    const workoutId = getValidWorkoutId(workout);
    if (!workoutId) {
      toast.error('No se puede duplicar esta rutina: ID inválido');
      return;
    }
    
    setSelectedWorkout(workout);
    setShowDuplicateModal(true);
    setError(null);
  }, [getValidWorkoutId]);

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
    const workoutId = getValidWorkoutId(workout);
    if (!workoutId) {
      toast.error('No se puede asignar esta rutina: ID inválido');
      return;
    }
    
    setSelectedWorkout(workout);
    setShowAssignModal(true);
    setError(null);
  }, [getValidWorkoutId]);

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

  const handleViewWorkout = useCallback((workoutId: string) => {
    if (!workoutId) {
      toast.error('No se puede ver esta rutina: ID inválido');
      return;
    }
    
    // Removed console.log
    router.replace(`/workout/${workoutId}`);
  }, [router]);

  const handleRenameClick = useCallback((workout: Workout) => {
    const workoutId = getValidWorkoutId(workout);
    if (!workoutId) {
      toast.error('No se puede renombrar esta rutina: ID inválido');
      return;
    }
    
    setSelectedWorkout(workout);
    setShowRenameModal(true);
    setError(null);
  }, [getValidWorkoutId]);

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
    const workoutId = getValidWorkoutId(workout);
    if (!workoutId) {
      toast.error('No se puede eliminar esta rutina: ID inválido');
      return;
    }
    
    setSelectedWorkout(workout);
    setShowDeleteModal(true);
    setError(null);
  }, [getValidWorkoutId]);

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

  // Memoize the rendered workout list to prevent unnecessary re-renders
  const renderedWorkoutList = useMemo(() => {
    return workouts.map((workout) => {
      const workoutId = getValidWorkoutId(workout);
      
      return (
        <div 
          key={workoutId || workout.name} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-0">
              {workout.name}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {workoutId && (
                <button
                  onClick={() => handleViewWorkout(workoutId)}
                  className="inline-flex items-center justify-center p-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label={`Ver rutina ${workout.name}`}
                  title="Ver rutina"
                >
                  <Eye className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => handleRenameClick(workout)}
                className="inline-flex items-center justify-center p-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                aria-label={`Renombrar rutina ${workout.name}`}
                title="Editar rutina"
              >
                <Edit className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => handleDuplicateClick(workout)}
                className="inline-flex items-center justify-center p-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-label={`Duplicar rutina ${workout.name}`}
                title="Duplicar rutina"
              >
                <Copy className="w-5 h-5" />
              </button>
              
              {isCoach && (
                <button
                  onClick={() => handleAssignClick(workout)}
                  className="inline-flex items-center justify-center p-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  aria-label={`Asignar rutina ${workout.name}`}
                  title="Asignar rutina"
                >
                  <Users className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => handleDeleteClick(workout)}
                className="inline-flex items-center justify-center p-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label={`Eliminar rutina ${workout.name}`}
                title="Eliminar rutina"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {workout.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{workout.description}</p>
          )}
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Días: {workout.days.length}</p>
            <p>Ejercicios: {workout.days.reduce((total, day) => 
              total + day.blocks.reduce((blockTotal, block) => 
                blockTotal + block.exercises.length, 0), 0)}
            </p>
          </div>
        </div>
      );
    });
  }, [workouts, isCoach, getValidWorkoutId, handleViewWorkout, handleRenameClick, handleDuplicateClick, handleAssignClick, handleDeleteClick]);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-4">
        {workouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No hay rutinas disponibles.</p>
          </div>
        ) : (
          renderedWorkoutList
        )}
      </div>

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