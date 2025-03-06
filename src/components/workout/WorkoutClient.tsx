'use client';

import { useState, useEffect } from 'react';
import { DiaRutina, Exercise, Rutina } from '@/types/models';
import WorkoutDetailHeader from '@/components/workout/WorkoutDetailHeader';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import WorkoutDay from '@/components/workout/WorkoutDay';

/**
 * Hook personalizado para obtener el rol real del usuario desde la API
 */
function useRealUserRole() {
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user role for:', session.user.email);
        // Endpoint que consultará el rol del usuario en la base de datos
        const response = await fetch(`/api/users/role?email=${encodeURIComponent(session.user.email)}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Role API response:', data);
          setRole(data.role);
        } else {
          console.error('Error fetching user role:', response.statusText);
          // Fallback al rol de la sesión si no podemos obtener el rol actualizado
          console.log('Falling back to session role:', session.user.role);
          setRole(session.user.role || null);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Fallback al rol de la sesión
        console.log('Falling back to session role after error:', session.user.role);
        setRole(session.user.role || null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
    
    // Recargar el rol cada 30 segundos para mantenerlo actualizado
    const intervalId = setInterval(fetchUserRole, 30000);
    
    return () => clearInterval(intervalId);
  }, [session]);
  
  console.log('Current user role from hook:', { role, loading, sessionRole: session?.user?.role });

  return { role, loading };
}

interface WorkoutClientProps {
  workout: Rutina;
  addDay: (workoutId: string, userId: string) => Promise<any>;
  addBlock: (workout: Rutina, dayIndex: number) => Promise<any>;
  addExercise: (workout: Rutina, dayIndex: number, blockIndex: number) => Promise<any>;
  updateExercise: (workout: Rutina, dayIndex: number, blockIndex: number, exerciseIndex: number, data: Partial<Exercise>) => Promise<any>;
  deleteExercise: (workout: Rutina, dayIndex: number, blockIndex: number, exerciseIndex: number) => Promise<any>;
  deleteBlock: (workout: Rutina, dayIndex: number, blockIndex: number) => Promise<any>;
  deleteDay: (workout: Rutina, dayIndex: number) => Promise<any>;
  deleteWorkout: (workoutId: string, userId: string) => Promise<any>;
  updateDayName?: (workout: Rutina, dayIndex: number, newName: string) => Promise<any>;
  updateBlockName?: (workout: Rutina, dayIndex: number, blockIndex: number, newName: string) => Promise<any>;
  userId: string;
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
  userId
}: WorkoutClientProps) {
  const [workout, setWorkout] = useState<Rutina>(initialWorkout);
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const { role: userRole, loading: roleLoading } = useRealUserRole();
  
  const isAdmin = userRole === 'admin';
  const isCoach = userRole === 'coach';
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  const [expandExercises, setExpandExercises] = useState(false);

  useEffect(() => {
    setWorkout(initialWorkout);
  }, [initialWorkout]);

  const handleAddDay = async () => {
    setIsLoading(true);
    try {
      const workoutId = workout._id?.toString() || workout.id || '';
      if (!workoutId) {
        throw new Error('ID de rutina no válido');
      }
      
      const result = await addDay(workoutId, userId);
      // Actualizar el estado local con el resultado
      setWorkout(result);
      
      // Expandir automáticamente el día recién creado
      const newDayIndex = (result.days?.length || 0) - 1;
      if (newDayIndex >= 0) {
        setExpandedDays(prev => ({
          ...prev,
          [newDayIndex]: true
        }));
      }
      
      toast.success('Día agregado correctamente');
    } catch (error: any) {
      console.error('Error al agregar día:', error);
      toast.error(`Error al agregar día: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlock = async (dayIndex: number) => {
    setIsLoading(true);
    
    try {
      const result = await addBlock(workout, dayIndex);
      
      // Actualizar el estado local con el resultado
      setWorkout(result);
      
      // Expandir automáticamente el día
      setExpandedDays(prev => ({
        ...prev,
        [dayIndex]: true
      }));
      
      // Expandir automáticamente el bloque recién creado
      const blockIndex = (result.days[dayIndex].blocks?.length || 0) - 1;
      const key = `${dayIndex}-${blockIndex}`;
      setExpandedBlocks(prev => ({
        ...prev,
        [key]: true
      }));
      
      toast.success('Bloque agregado correctamente');
    } catch (error: any) {
      console.error('Error al agregar bloque:', error);
      
      if (error.message === 'Day not found') {
        toast.error('Día no encontrado');
      } else if (error.message === 'Workout not found') {
        toast.error('Rutina no encontrada');
      } else if (error.message === 'No autorizado') {
        toast.error('No tienes permiso para agregar bloques');
      } else {
        toast.error(`Error al agregar bloque: ${error.message || 'Error desconocido'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExercise = async (dayIndex: number, blockIndex: number) => {
    try {
      const result = await addExercise(workout, dayIndex, blockIndex);
      // Actualizar el estado local con el resultado
      setWorkout(result);
      toast.success('Ejercicio añadido correctamente');
    } catch (error) {
      console.error('Error adding exercise:', error);
      toast.error('Error al añadir el ejercicio');
    }
  };

  const handleUpdateExercise = async (dayIndex: number, blockIndex: number, exerciseIndex: number, data: any) => {
    try {
      const result = await updateExercise(workout, dayIndex, blockIndex, exerciseIndex, data);
      // Actualizar el estado local con el resultado
      setWorkout(result);
      toast.success('Ejercicio actualizado correctamente');
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast.error('Error al actualizar el ejercicio');
    }
  };

  const handleDeleteExercise = async (dayIndex: number, blockIndex: number, exerciseIndex: number) => {
    try {
      const result = await deleteExercise(workout, dayIndex, blockIndex, exerciseIndex);
      // Actualizar el estado local con el resultado
      setWorkout(result);
      toast.success('Ejercicio eliminado correctamente');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error('Error al eliminar el ejercicio');
    }
  };

  const handleDeleteBlock = async (dayIndex: number, blockIndex: number) => {
    try {
      const result = await deleteBlock(workout, dayIndex, blockIndex);
      // Actualizar el estado local con el resultado
      setWorkout(result);
      toast.success('Bloque eliminado correctamente');
      
      // Actualizar los bloques expandidos
      setExpandedBlocks(prev => {
        const newExpandedBlocks: Record<string, boolean> = {};
        
        Object.keys(prev).forEach(key => {
          const [day, block] = key.split('-').map(Number);
          
          if (day !== dayIndex) {
            // Mantener los bloques de otros días
            newExpandedBlocks[key] = prev[key];
          } else if (block < blockIndex) {
            // Mantener los bloques anteriores del mismo día
            newExpandedBlocks[key] = prev[key];
          } else if (block > blockIndex) {
            // Reajustar los índices para los bloques posteriores
            newExpandedBlocks[`${day}-${block - 1}`] = prev[key];
          }
          // El bloque eliminado no se incluye
        });
        
        return newExpandedBlocks;
      });
    } catch (error) {
      console.error('Error deleting block:', error);
      toast.error('Error al eliminar el bloque');
    }
  };

  const handleDeleteDay = async (dayIndex: number) => {
    try {
      const result = await deleteDay(workout, dayIndex);
      // Actualizar el estado local con el resultado
      setWorkout(result);
      toast.success('Día eliminado correctamente');

      // Actualizar también los estados expandidos para evitar referencias a días que ya no existen
      setExpandedDays(prev => {
        const newExpandedDays = { ...prev };
        delete newExpandedDays[dayIndex];
        
        // Reajustar las claves para los días posteriores al eliminado
        Object.keys(newExpandedDays).forEach(key => {
          const keyNum = parseInt(key);
          if (keyNum > dayIndex) {
            newExpandedDays[keyNum - 1] = newExpandedDays[keyNum];
            delete newExpandedDays[keyNum];
          }
        });
        
        return newExpandedDays;
      });
      
      // Actualizar también los bloques expandidos
      setExpandedBlocks(prev => {
        const newExpandedBlocks: Record<string, boolean> = {};
        
        Object.keys(prev).forEach(key => {
          const [day, block] = key.split('-').map(Number);
          
          if (day < dayIndex) {
            // Mantener los bloques de días anteriores
            newExpandedBlocks[key] = prev[key];
          } else if (day > dayIndex) {
            // Reajustar los índices para los días posteriores
            newExpandedBlocks[`${day - 1}-${block}`] = prev[key];
          }
          // Los bloques del día eliminado no se incluyen
        });
        
        return newExpandedBlocks;
      });
    } catch (error) {
      console.error('Error deleting day:', error);
      toast.error('Error al eliminar el día');
    }
  };

  const handleDeleteWorkout = async () => {
    try {
      console.log('Starting workout deletion...', {
        workoutId: workout.id || workout._id?.toString(),
        userId
      });

      await deleteWorkout(workout.id!, userId);
      console.log('Workout deleted successfully');
      
      // First refresh the current page data
      router.refresh();
      
      // Wait a brief moment to ensure revalidation completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then navigate back to the workouts list
      router.push('/workout');
      
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const handleUpdateDayName = async (dayIndex: number, newName: string) => {
    setIsLoading(true);
    
    try {
      if (!updateDayName) {
        throw new Error('Función de actualizar nombre del día no disponible');
      }
      
      await updateDayName(workout, dayIndex, newName);
      setWorkout((prev: Rutina) => {
        const newWorkout = {...prev};
        if (newWorkout.days && newWorkout.days[dayIndex]) {
          newWorkout.days[dayIndex].name = newName;
        }
        return newWorkout;
      });
      toast.success('Nombre del día actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar el nombre del día:', error);
      toast.error(`Error al actualizar el nombre: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBlockName = async (dayIndex: number, blockIndex: number, newName: string) => {
    setIsLoading(true);
    
    try {
      if (!updateBlockName) {
        throw new Error('Función de actualizar nombre del bloque no disponible');
      }
      
      await updateBlockName(workout, dayIndex, blockIndex, newName);
      setWorkout((prev: Rutina) => {
        const newWorkout = {...prev};
        if (newWorkout.days && 
            newWorkout.days[dayIndex] && 
            newWorkout.days[dayIndex].blocks && 
            newWorkout.days[dayIndex].blocks[blockIndex]) {
          newWorkout.days[dayIndex].blocks[blockIndex].name = newName;
        }
        return newWorkout;
      });
      toast.success('Nombre del bloque actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar el nombre del bloque:', error);
      toast.error(`Error al actualizar el nombre: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const expandAll = () => {
    // Crear nuevos objetos para los estados para evitar referencias a los anteriores
    const allDaysExpanded: Record<number, boolean> = {};
    const allBlocksExpanded: Record<string, boolean> = {};
    
    // Llenar los objetos con los datos necesarios
    if (workout.days) {
      workout.days.forEach((day, dayIndex) => {
        allDaysExpanded[dayIndex] = true;
        
        if (day.blocks) {
          day.blocks.forEach((_, blockIndex) => {
            const key = `${dayIndex}-${blockIndex}`;
            allBlocksExpanded[key] = true;
          });
        }
      });
    }
    
    // Actualizar los estados en un solo batch para evitar múltiples re-renders
    // que podrían causar loops infinitos
    const shouldUpdateDays = JSON.stringify(expandedDays) !== JSON.stringify(allDaysExpanded);
    const shouldUpdateBlocks = JSON.stringify(expandedBlocks) !== JSON.stringify(allBlocksExpanded);
    
    // Solo actualizar si hay cambios para evitar loops infinitos
    if (shouldUpdateDays) {
      setExpandedDays(allDaysExpanded);
    }
    
    if (shouldUpdateBlocks) {
      setExpandedBlocks(allBlocksExpanded);
    }
    
    if (!expandExercises) {
      setExpandExercises(true);
    }
  };

  const collapseAll = () => {
    // Solo actualizar si hay cambios para evitar loops infinitos
    if (Object.keys(expandedDays).length > 0) {
      setExpandedDays({});
    }
    
    if (Object.keys(expandedBlocks).length > 0) {
      setExpandedBlocks({});
    }
    
    if (expandExercises) {
      setExpandExercises(false);
    }
  };

  return (
    <div className="pb-10">
      <WorkoutDetailHeader
        name={workout.name}
        description={workout.description}
      />
      
      <div className="flex items-center justify-end mt-4 mb-6">
        {isAdmin || isCoach ? (
          <button
            onClick={handleDeleteWorkout}
            className="ml-4 px-4 py-2 bg-red-600 text-white dark:bg-red-700 dark:hover:bg-red-800 rounded-md hover:bg-red-700 transition-colors"
          >
            Eliminar Rutina
          </button>
        ) : null}
      </div>
      
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
              <WorkoutDay
                key={dayIndex}
                title={day.name}
                blocks={day.blocks || []}
                isExpanded={expandedDays[dayIndex] || false}
                expandExercises={expandExercises}
                expandedBlocks={expandedBlocks}
                setExpandedBlocks={setExpandedBlocks}
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
    </div>
  );
} 