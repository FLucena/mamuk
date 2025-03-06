'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiEdit2, FiTrash2, FiEye, FiCopy, FiUsers, FiEdit } from 'react-icons/fi';
import DeleteWorkoutModal from '../modals/DeleteWorkoutModal';
import DuplicateWorkoutModal from '../modals/DuplicateWorkoutModal';
import AssignWorkoutModal from '../modals/AssignWorkoutModal';
import RenameWorkoutModal from '../modals/RenameWorkoutModal';
import { handleArchiveWorkout } from '@/app/workout/actions';
import { duplicateWorkout, assignWorkoutToUser, updateWorkoutName } from '@/app/workout/[id]/actions';
import { toast } from 'sonner';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
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

  const handleDeleteConfirm = async () => {
    if (!selectedWorkout) return;
    
    const workoutId = getValidWorkoutId(selectedWorkout);
    if (!workoutId) {
      toast.error('No se puede eliminar esta rutina: ID inválido');
      setShowDeleteModal(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await handleArchiveWorkout(workoutId);
      
      setWorkouts(prevWorkouts => 
        prevWorkouts.filter(w => getValidWorkoutId(w) !== workoutId)
      );
      
      setShowDeleteModal(false);
      toast.success('Rutina eliminada exitosamente');
      
      router.refresh();
    } catch (error) {
      setError('Error al eliminar la rutina. Por favor, inténtalo de nuevo.');
      toast.error('Error al eliminar la rutina');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDuplicate = async (newName: string, workoutId: string) => {
    if (!workoutId || !newName) {
      console.error('ID de rutina o nuevo nombre no definido', { workoutId, newName });
      setError('ID de rutina o nuevo nombre no definido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Intentando duplicar rutina:', workoutId);
      const duplicated = await duplicateWorkout(workoutId, newName);
      console.log('Rutina duplicada con éxito:', duplicated);
      
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
      console.error('Error al duplicar la rutina:', error);
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

  const handleAssign = async (targetUserId: string) => {
    if (!selectedWorkout) return;

    const workoutId = getValidWorkoutId(selectedWorkout);
    if (!workoutId) {
      toast.error('No se puede asignar esta rutina: ID inválido');
      return;
    }

    try {
      console.log('Asignando rutina con ID:', workoutId, 'a usuario:', targetUserId);
      const assigned = await assignWorkoutToUser(workoutId, targetUserId);
      
      // Actualizar la lista local de rutinas (opcional, ya que hacemos refresh)
      setWorkouts(currentWorkouts => 
        currentWorkouts.filter(w => getValidWorkoutId(w) !== workoutId)
      );
      
      router.refresh();
      toast.success(`Rutina "${selectedWorkout.name}" asignada correctamente`);
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error durante la asignación de rutina:', error);
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

  const handleRename = async (workoutId: string, newName: string) => {
    if (!workoutId || !newName) {
      console.error('ID de rutina o nuevo nombre no definido', { workoutId, newName });
      setError('ID de rutina o nuevo nombre no definido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Renombrando rutina:', workoutId, 'Nuevo nombre:', newName);
      const updatedWorkout = await updateWorkoutName(workoutId, newName);
      
      // Actualizar la lista de rutinas
      setWorkouts(prevWorkouts => 
        prevWorkouts.map(w => 
          getValidWorkoutId(w) === workoutId ? { ...w, name: newName } : w
        )
      );
      
      setShowRenameModal(false);
      toast.success('Rutina renombrada exitosamente');
      
      router.refresh();
    } catch (error) {
      console.error('Error al renombrar la rutina:', error);
      setError('Error al renombrar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al renombrar la rutina');
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
                    <Link
                      href={`/workout/${workoutId}`}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                      title="Ver rutina"
                    >
                      <FiEye className="w-5 h-5" />
                    </Link>
                  )}
                  
                  <button
                    onClick={() => handleRenameClick(workout)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    title="Renombrar rutina"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDuplicateClick(workout)}
                    className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full"
                    title="Duplicar rutina"
                  >
                    <FiCopy className="w-5 h-5" />
                  </button>
                  
                  {isCoach && (
                    <button
                      onClick={() => handleAssignClick(workout)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                      title="Asignar rutina a usuario"
                    >
                      <FiUsers className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteClick(workout)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                    title="Eliminar rutina"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedWorkout && (
        <>
          <DeleteWorkoutModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
            isDeleting={loading}
            error={error}
          />

          <DuplicateWorkoutModal
            isOpen={showDuplicateModal}
            onClose={() => setShowDuplicateModal(false)}
            workoutId={getValidWorkoutId(selectedWorkout) || ''}
            workoutName={selectedWorkout.name}
            onDuplicate={handleDuplicate}
          />

          <RenameWorkoutModal
            isOpen={showRenameModal}
            onClose={() => setShowRenameModal(false)}
            workoutId={getValidWorkoutId(selectedWorkout) || ''}
            currentName={selectedWorkout.name}
            onRename={handleRename}
          />

          {isCoach && (
            <AssignWorkoutModal
              isOpen={showAssignModal}
              onClose={() => setShowAssignModal(false)}
              workoutId={getValidWorkoutId(selectedWorkout) || ''}
              workoutName={selectedWorkout.name}
              onAssign={handleAssign}
            />
          )}
        </>
      )}
    </div>
  );
} 