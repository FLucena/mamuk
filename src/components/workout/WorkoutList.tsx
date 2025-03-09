'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/Icon';

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

export default function WorkoutList({ workouts: initialWorkouts, isCoach = false }: WorkoutListProps) {
  const router = useRouter();
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar los workouts y actualizarlos cuando cambien las props
  useEffect(() => {
    setWorkouts(initialWorkouts);
  }, [initialWorkouts]);

  function getValidWorkoutId(workout: Workout): string | null {
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
  }

  const handleDuplicateClick = (workout: Workout) => {
    const workoutId = getValidWorkoutId(workout);
    if (!workoutId) {
      toast.error('No se puede duplicar esta rutina: ID inválido');
      return;
    }
    
    setSelectedWorkout(workout);
    setShowDuplicateModal(true);
    setError(null);
  };

  const handleDuplicate = async (newName: string, newDescription: string, workoutId: string) => {
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
      setWorkouts(prevWorkouts => [duplicated, ...prevWorkouts]);
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
  };

  const handleAssignClick = (workout: Workout) => {
    const workoutId = getValidWorkoutId(workout);
    if (!workoutId) {
      toast.error('No se puede asignar esta rutina: ID inválido');
      return;
    }
    
    setSelectedWorkout(workout);
    setShowAssignModal(true);
    setError(null);
  };

  const handleAssign = async (data: { coachIds: string[]; customerIds: string[] }) => {
    if (!selectedWorkout) return;

    const workoutId = getValidWorkoutId(selectedWorkout);
    if (!workoutId) {
      toast.error('No se puede asignar esta rutina: ID inválido');
      return;
    }

    try {
      await assignWorkoutToUser(workoutId, data);
      
      // Actualizar la lista local de rutinas (opcional, ya que hacemos refresh)
      setWorkouts(currentWorkouts => 
        currentWorkouts.filter(w => getValidWorkoutId(w) !== workoutId)
      );
      
      router.refresh();
      setShowAssignModal(false);
      toast.success('Rutina asignada exitosamente');
    } catch (error) {
      setError('Error al asignar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al asignar la rutina');
    }
  };

  const handleViewWorkout = (workoutId: string) => {
    if (!workoutId) {
      toast.error('No se puede ver esta rutina: ID inválido');
      return;
    }
    
    router.push(`/workout/${workoutId}`);
  };

  const handleRenameClick = (workout: Workout) => {
    const workoutId = getValidWorkoutId(workout);
    if (!workoutId) {
      toast.error('No se puede renombrar esta rutina: ID inválido');
      return;
    }
    
    setSelectedWorkout(workout);
    setShowRenameModal(true);
    setError(null);
  };

  const handleRename = async (workoutId: string, newName: string, newDescription: string) => {
    if (!workoutId || !newName) {
      setError('ID de rutina o nuevo nombre no definido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedWorkout = await updateWorkoutName(workoutId, newName, newDescription);

      // Actualizar la lista de rutinas
      setWorkouts(prevWorkouts =>
        prevWorkouts.map(w => 
          getValidWorkoutId(w) === workoutId 
            ? { ...w, name: newName, description: newDescription } 
            : w
        )
      );

      setShowRenameModal(false);
      toast.success('Rutina actualizada exitosamente');
      
      router.refresh();
    } catch (error) {
      setError('Error al actualizar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (workout: Workout) => {
    const workoutId = getValidWorkoutId(workout);
    if (!workoutId) {
      toast.error('No se puede eliminar esta rutina: ID inválido');
      return;
    }
    
    setSelectedWorkout(workout);
    setShowDeleteModal(true);
    setError(null);
  };

  const handleDelete = async (workoutId: string) => {
    if (!workoutId) {
      setError('ID de rutina no definido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Obtener el ID del usuario de la rutina seleccionada
      const userId = selectedWorkout?.userId || '';
      
      await deleteWorkout(workoutId, userId);
      
      // Actualizar la lista local de rutinas
      setWorkouts(prevWorkouts => 
        prevWorkouts.filter(w => getValidWorkoutId(w) !== workoutId)
      );
      
      setShowDeleteModal(false);
      toast.success('Rutina eliminada exitosamente');
      
      router.refresh();
    } catch (error) {
      setError('Error al eliminar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la rutina');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && !selectedWorkout && <div className="py-10 text-center">Cargando...</div>}
      
      {!loading && workouts.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No hay rutinas disponibles</p>
        </div>
      )}
      
      {workouts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => {
            const workoutId = getValidWorkoutId(workout);
            const isValidId = !!workoutId;
            
            return (
              <div
                key={workout._id || workout.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 line-clamp-2">
                    {workout.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {workout.description || 'Sin descripción'}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="mr-2">{workout.days?.length || 0} días</span>
                    <span>{new Date(workout.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
                  {isValidId && (
                    <button
                      onClick={() => handleViewWorkout(workoutId)}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Ver rutina"
                    >
                      <Icon icon="FiEye" className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleRenameClick(workout)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Renombrar rutina"
                  >
                    <Icon icon="FiEdit2" className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDuplicateClick(workout)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Duplicar rutina"
                  >
                    <Icon icon="FiCopy" className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteClick(workout)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Eliminar rutina"
                  >
                    <Icon icon="FiTrash2" className="w-5 h-5" />
                  </button>
                  
                  {isCoach && (
                    <button
                      onClick={() => handleAssignClick(workout)}
                      className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      title="Asignar rutina a usuario"
                    >
                      <Icon icon="FiUsers" className="w-5 h-5" />
                    </button>
                  )}
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
            workoutId={getValidWorkoutId(selectedWorkout) || ''}
            workoutName={selectedWorkout.name}
            workoutDescription={selectedWorkout.description || ''}
            onDuplicate={handleDuplicate}
          />

          <RenameWorkoutModal
            isOpen={showRenameModal}
            onClose={() => setShowRenameModal(false)}
            workoutId={getValidWorkoutId(selectedWorkout) || ''}
            currentName={selectedWorkout.name}
            currentDescription={selectedWorkout.description || ''}
            onRename={handleRename}
          />

          <DeleteWorkoutModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            workoutId={getValidWorkoutId(selectedWorkout) || ''}
            workoutName={selectedWorkout.name}
            onDelete={handleDelete}
          />

          {isCoach && (
            <AssignWorkoutModal
              isOpen={showAssignModal}
              onClose={() => setShowAssignModal(false)}
              workoutId={getValidWorkoutId(selectedWorkout) || ''}
              workoutName={selectedWorkout.name}
              workoutDescription={selectedWorkout.description || ''}
              onAssign={handleAssign}
            />
          )}
        </>
      )}
    </div>
  );
} 