'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';
import { Types } from 'mongoose';
import { getCurrentUserRole } from '@/lib/utils/permissions';
import User from '@/lib/models/user';
import { ObjectId } from 'mongodb';
import { sanitizeHtml, validateMongoId } from '@/lib/utils/security';
import { Workout as WorkoutType, Exercise } from '@/types/models';
import { exerciseList } from '@/data/exercises';
import { BodyZone, bodyZones } from '@/lib/constants/bodyZones';
import mongoose from 'mongoose';

// First, add this interface near the top of the file
interface WorkoutAssignment {
  _id: Types.ObjectId;
  assignedCoaches: Types.ObjectId[];
  assignedCustomers: Types.ObjectId[];
  name: string;
  __v?: number;
}

// Helper function to convert exercise type to BodyZone tag
function typeToBodyZone(type: string): BodyZone[] {
  const typeLower = type.toLowerCase();
  
  // Direct mappings
  const mappings: Record<string, BodyZone[]> = {
    'pecho': ['Pecho'],
    'espalda': ['Espalda'],
    'piernas': ['Piernas'],
    'hombros': ['Hombros'],
    'brazos': ['Bíceps', 'Tríceps'],
    'biceps': ['Bíceps'],
    'triceps': ['Tríceps'],
    'core': ['Core', 'Abdominales'],
    'abdominales': ['Abdominales'],
    'gluteos': ['Glúteos'],
    'cardio': ['Cardio'],
  };
  
  return mappings[typeLower] || ['Full Body'];
}

function getRandomExercises(count: number) {
  // Ensure we get a good mix of exercises by shuffling the list
  const shuffled = [...exerciseList].sort(() => Math.random() - 0.5);
  
  // Take the first 'count' exercises
  return shuffled.slice(0, count).map(exercise => ({
    id: exercise.id,
    name: exercise.name,
    sets: 3,
    reps: 12,
    weight: 0,
    videoUrl: exercise.videoUrl || '',
    notes: exercise.notes || '',
    tags: typeToBodyZone(exercise.type)
  }));
}

export async function addDay(workoutId: string, userId: string) {
  if (!workoutId || !userId) throw new Error('Workout ID and User ID are required');
  if (!validateMongoId(workoutId)) throw new Error('Invalid workout ID');

  await dbConnect();
  try {
    const workout = await Workout.findOne({
      _id: new Types.ObjectId(workoutId),
      userId: userId.toString()
    });

    if (!workout) throw new Error('Workout not found');

    const defaultBlocks = Array.from({ length: 3 }, (_, blockIndex) => ({
      name: `Bloque ${blockIndex + 1}`,
      exercises: getRandomExercises(3)
    }));

    const newDay = {
      name: `Día ${workout.days.length + 1}`,
      blocks: defaultBlocks
    };

    workout.days.push(newDay);
    await workout.save();

    revalidatePath(`workout-${workoutId}`);
    return JSON.parse(JSON.stringify(workout.toObject()));
  } catch (error) {
    console.error('Error adding day:', error);
    throw error;
  }
}

export async function addBlock(workout: WorkoutType, dayIndex: number) {
  console.log('Starting addBlock function with:', {
    workoutId: workout.id,
    dayIndex,
    workout: {
      id: workout.id,
      name: workout.name,
      days: workout.days?.length
    }
  });

  const session = await getServerSession(authOptions);
  console.log('Session info:', {
    userId: session?.user?.id,
    email: session?.user?.email,
    isAuthorized: !!session?.user?.id
  });

  if (!session?.user?.id || !session?.user?.email) {
    // Removed console.log
    throw new Error('No autorizado');
  }

  // En este caso no necesitamos verificar el rol, pero podríamos hacerlo
  // para acciones más restrictivas
  // const userRole = await getCurrentUserRole(session.user.email);
  // // Removed console.log

  if (dayIndex < 0) {
    // Removed console.log
    throw new Error('Invalid day index');
  }

  await dbConnect();
  // Removed console.log

  try {
    const workoutId = workout.id;
    // Removed console.log

    if (!workoutId) {
      // Removed console.log
      throw new Error('Invalid workout ID');
    }

    if (!validateMongoId(workoutId)) {
      // Removed console.log
      throw new Error('Invalid workout ID format');
    }

    console.log('Searching for workout with criteria:', {
      _id: workoutId,
      userId: session.user.id
    });

    const workoutDoc = await Workout.findOne({
      _id: new Types.ObjectId(workoutId),
      userId: session.user.id.toString()
    });

    console.log('Workout document found:', {
      found: !!workoutDoc,
      daysCount: workoutDoc?.days?.length,
      requestedDayIndex: dayIndex,
      dayInfo: workoutDoc?.days?.[dayIndex] ? {
        name: workoutDoc.days[dayIndex].name,
        blocksCount: workoutDoc.days[dayIndex].blocks.length
      } : null
    });

    if (!workoutDoc) {
      // Removed console.log
      throw new Error('Workout not found');
    }

    if (!workoutDoc.days || dayIndex >= workoutDoc.days.length) {
      console.log('Day not found:', {
        hasDays: !!workoutDoc.days,
        daysLength: workoutDoc.days?.length,
        requestedIndex: dayIndex
      });
      throw new Error('Day not found');
    }

    // Get random exercises for the new block
    const randomExercises = getRandomExercises(3);
    // Removed console.log

    const newBlock = {
      name: `Bloque ${workoutDoc.days[dayIndex].blocks.length + 1}`,
      exercises: randomExercises
    };
    // Removed console.log

    workoutDoc.days[dayIndex].blocks.push(newBlock);
    // Removed console.log

    await workoutDoc.save();
    // Removed console.log

    revalidatePath(`workout-${workoutId}`);
    // Removed console.log

    // Convert to plain object to avoid React serialization issues
    const workoutObject = JSON.parse(JSON.stringify(workoutDoc.toObject()));
    return workoutObject;
  } catch (error) {
    console.error('Error in addBlock:', {
      error,
      workoutId: workout.id,
      dayIndex
    });
    throw error;
  }
}

export async function addExercise(workout: WorkoutType, dayIndex: number, blockIndex: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  await dbConnect();
  try {
    const workoutDoc = await Workout.findOne({
      _id: new Types.ObjectId(workout.id),
      userId: session.user.id.toString()
    });

    if (!workoutDoc) throw new Error('Workout not found');

    const newExercise = {
      name: 'Nuevo ejercicio',
      sets: 3,
      reps: 12,
      weight: 0,
      tags: []
    };

    workoutDoc.days[dayIndex].blocks[blockIndex].exercises.push(newExercise);
    await workoutDoc.save();

    revalidatePath(`workout-${workout.id}`);
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw error;
  }
}

export async function updateExercise(
  workout: WorkoutType,
  dayIndex: number,
  blockIndex: number,
  exerciseIndex: number,
  data: Partial<Exercise>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  await dbConnect();
  try {
    const workoutDoc = await Workout.findOne({
      _id: new Types.ObjectId(workout.id),
      userId: session.user.id.toString()
    });

    if (!workoutDoc) throw new Error('Workout not found');

    const exercise = workoutDoc.days[dayIndex].blocks[blockIndex].exercises[exerciseIndex];
    Object.assign(exercise, data);
    await workoutDoc.save();

    revalidatePath(`workout-${workout.id}`);
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }
}

export async function deleteExercise(
  workout: WorkoutType,
  dayIndex: number,
  blockIndex: number,
  exerciseIndex: number
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  await dbConnect();
  try {
    const workoutDoc = await Workout.findOne({
      _id: new Types.ObjectId(workout.id),
      userId: session.user.id.toString()
    });

    if (!workoutDoc) throw new Error('Workout not found');

    workoutDoc.days[dayIndex].blocks[blockIndex].exercises.splice(exerciseIndex, 1);
    await workoutDoc.save();

    revalidatePath(`workout-${workout.id}`);
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
}

export async function deleteDay(workout: WorkoutType, dayIndex: number) {
  console.log('Server action: deleteDay started', {
    workoutId: workout.id || (workout as any)._id?.toString(),
    dayIndex
  });

  await dbConnect();
  try {
    const workoutDoc = await Workout.findOne({
      _id: new Types.ObjectId(workout.id),
      userId: workout.userId.toString()
    });

    if (!workoutDoc) throw new Error('Workout not found');

    workoutDoc.days.splice(dayIndex, 1);
    await workoutDoc.save();

    // Removed console.log
    
    // Revalidate both the specific workout and the list
    revalidatePath(`workout-${workout.id}`);
    revalidatePath('workouts-list');
    
    // Removed console.log
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error in deleteDay action:', error);
    throw error;
  }
}

export async function deleteBlock(workout: WorkoutType, dayIndex: number, blockIndex: number) {
  console.log('Server action: deleteBlock started', {
    workoutId: workout.id || (workout as any)._id?.toString(),
    dayIndex,
    blockIndex
  });

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  await dbConnect();
  try {
    const workoutDoc = await Workout.findOne({
      _id: new Types.ObjectId(workout.id),
      userId: session.user.id.toString()
    });

    if (!workoutDoc) throw new Error('Workout not found');

    workoutDoc.days[dayIndex].blocks.splice(blockIndex, 1);
    await workoutDoc.save();

    revalidatePath(`workout-${workout.id}`);
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error deleting block:', error);
    throw error;
  }
}

export async function deleteWorkout(workoutId: string, userId: string) {
  if (!workoutId || !userId) {
    console.error('Workout ID and User ID are required');
    throw new Error('Workout ID and User ID are required');
  }
  if (!validateMongoId(workoutId)) throw new Error('Invalid workout ID');

  // Removed console.log

  await dbConnect();
  try {
    // Removed console.log
    const result = await Workout.findOneAndDelete({
      _id: new Types.ObjectId(workoutId),
      userId: userId.toString()
    });

    if (!result) {
      console.error('Workout not found');
      throw new Error('Workout not found');
    }

    // Removed console.log
    
    // Revalidate both the specific workout and the workouts list
    revalidatePath(`workout-${workoutId}`);
    revalidatePath('workouts-list');
    
    // Wait a moment to ensure revalidation is processed
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Removed console.log
    return { success: true };
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
}

/**
 * Duplica un workout existente
 * Versión mejorada con validaciones adicionales y mejor manejo de errores
 */
export async function duplicateWorkout(workoutId: string, newName?: string, newDescription?: string) {
  // Removed console.log
  
  try {
    // Validar que el ID del workout sea proporcionado
    if (!workoutId) {
      console.error('[SECURITY] Intento de duplicación sin ID de workout');
      throw new Error('ID de rutina no definido');
    }
    
    // Validar que el ID sea un string
    if (typeof workoutId !== 'string') {
      console.error(`[SECURITY] ID de workout con tipo incorrecto: ${typeof workoutId}`);
      throw new Error('ID de rutina inválido');
    }
    
    // Validar que el ID tenga el formato correcto de MongoDB
    if (!validateMongoId(workoutId)) {
      console.error(`[SECURITY] ID de workout con formato inválido: ${workoutId}`);
      throw new Error('ID de rutina inválido');
    }
    
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error('[SECURITY] Intento de duplicación sin sesión de usuario');
      throw new Error('No autorizado');
    }
    
    // Verificar el rol del usuario
    const userRole = await getCurrentUserRole(session.user.email || '');
    const isAdmin = userRole === 'admin';
    
    // Obtener el workout original
    const originalWorkout = await Workout.findById(workoutId);
    if (!originalWorkout) {
      console.error(`[SECURITY] Intento de duplicación de workout inexistente. ID: ${workoutId}`);
      throw new Error('Rutina no encontrada');
    }
    
    // Verificar que el usuario sea el propietario o un administrador
    if (originalWorkout.userId.toString() !== session.user.id && !isAdmin) {
      console.error(`[SECURITY] Intento de duplicación no autorizado. Usuario: ${session.user.id}, Propietario: ${originalWorkout.userId}`);
      throw new Error('No autorizado para duplicar esta rutina');
    }
    
    // Sanitizar los datos antes de duplicar
    const sanitizedName = sanitizeHtml(newName || originalWorkout.name);
    const sanitizedDescription = sanitizeHtml(newDescription !== undefined ? newDescription : originalWorkout.description);
    
    // Crear el nuevo workout
    const workoutData = originalWorkout.toObject();
    delete workoutData._id;
    
    // Asignar nuevos IDs a todos los días, bloques y ejercicios
    workoutData.days = workoutData.days.map((day: any) => {
      // Crear un nuevo ID para el día
      const dayId = new mongoose.Types.ObjectId().toString();
      
      // Crear un nuevo día con el ID generado
      const newDay = { 
        ...day, 
        id: dayId 
      };
      
      // Eliminar _id si existe
      delete newDay._id;
      
      // Procesar los bloques del día
      newDay.blocks = (newDay.blocks || []).map((block: any) => {
        // Crear un nuevo ID para el bloque
        const blockId = new mongoose.Types.ObjectId().toString();
        
        // Crear un nuevo bloque con el ID generado
        const newBlock = { 
          ...block, 
          id: blockId 
        };
        
        // Eliminar _id si existe
        delete newBlock._id;
        
        // Procesar los ejercicios del bloque
        newBlock.exercises = (newBlock.exercises || []).map((exercise: any) => {
          // Crear un nuevo ID para el ejercicio
          const exerciseId = new mongoose.Types.ObjectId().toString();
          
          // Crear un nuevo ejercicio con el ID generado
          const newExercise = { 
            ...exercise, 
            id: exerciseId 
          };
          
          // Eliminar _id si existe
          delete newExercise._id;
          
          return newExercise;
        });
        
        return newBlock;
      });
      
      return newDay;
    });
    
    // Crear la nueva rutina
    const newWorkout = new Workout({
      ...workoutData,
      name: newName ? sanitizedName : `${sanitizedName} (Copia)`,
      description: sanitizedDescription,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Guardar el nuevo workout
    await newWorkout.save();
    
    // Removed console.log
    
    // Convertir el objeto Mongoose a un objeto plano para que sea serializable
    try {
      // Primero intentamos con toObject que es más seguro
      const workoutObj = newWorkout.toObject ? newWorkout.toObject() : newWorkout;
      
      // Luego serializamos completamente para asegurar compatibilidad con Next.js
      const serializedWorkout = JSON.parse(JSON.stringify(workoutObj));
      
      // Asegurarnos de que el ID esté disponible en ambos formatos para compatibilidad
      if (serializedWorkout._id) {
        serializedWorkout.id = typeof serializedWorkout._id === 'string' 
          ? serializedWorkout._id 
          : serializedWorkout._id.toString();
      }
      
      // Removed console.log
      return serializedWorkout;
    } catch (serializationError) {
      console.error('[ERROR] Error al serializar el workout:', serializationError);
      
      // Plan de respaldo: crear manualmente un objeto con solo los datos necesarios
      const fallbackObject = {
        id: newWorkout._id.toString(),
        _id: newWorkout._id.toString(),
        name: newWorkout.name,
        description: newWorkout.description || '',
        days: newWorkout.days || [],
        userId: newWorkout.userId.toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Removed console.log
      return fallbackObject;
    }
  } catch (error) {
    console.error('[ERROR] Error al duplicar workout:', error);
    throw error;
  }
}

/**
 * Asigna una rutina a un usuario
 */
export async function assignWorkoutToUser(
  workoutId: string, 
  data: { coachIds: string[]; customerIds: string[] }
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  const startTime = Date.now();
  
  try {
    console.log('[Assignment] Starting database transaction', {
      workoutId,
      coachCount: data.coachIds.length,
      customerCount: data.customerIds.length,
      sessionId: session.id
    });

    // Validación mejorada de IDs
    const allIds = [workoutId, ...data.coachIds, ...data.customerIds];
    const invalidIds = allIds.filter(id => !validateMongoId(id));
    
    if (invalidIds.length > 0) {
      console.error('[ASSIGN] Error: IDs con formato inválido', { invalidIds });
      throw new Error(`IDs inválidos detectados: ${invalidIds.join(', ')}`);
    }

    // 1. Update workout assignments
    console.log('[Assignment] Updating workout document', {
      workoutId,
      updateOperation: 'addToSet',
      coachIds: data.coachIds.slice(0, 5), // Log first 5 to avoid overflow
      customerIds: data.customerIds.slice(0, 5)
    });

    const updatedWorkout = await Workout.findByIdAndUpdate(
      workoutId,
      {
        $addToSet: {
          assignedCoaches: { $each: data.coachIds.map(id => new Types.ObjectId(id)) },
          assignedCustomers: { $each: data.customerIds.map(id => new Types.ObjectId(id)) }
        }
      },
      { new: true, runValidators: true, session }
    ).lean<WorkoutAssignment>();

    if (!updatedWorkout) {
      throw new Error('Workout no encontrado o actualización fallida');
    }

    // 2. Update user documents
    const updateOperations = [
      ...data.coachIds.map(userId => 
        User.findByIdAndUpdate(
          userId,
          { $addToSet: { coachedWorkouts: workoutId } },
          { session }
        )
      ),
      ...data.customerIds.map(userId => 
        User.findByIdAndUpdate(
          userId,
          { $addToSet: { assignedWorkouts: workoutId } },
          { session }
        )
      )
    ];

    console.log('[Assignment] User documents update started', {
      totalOperations: updateOperations.length,
      sampleCoachId: data.coachIds[0] || 'none',
      sampleCustomerId: data.customerIds[0] || 'none'
    });

    await Promise.all(updateOperations);

    console.log('[Assignment] All user updates completed', {
      workoutId,
      duration: Date.now() - startTime + 'ms'
    });

    // Remove the manual conversion and use type assertion
    const result = {
      success: true,
      id: workoutId,
      assignedCoaches: data.coachIds,
      assignedCustomers: data.customerIds,
      name: (updatedWorkout as unknown as WorkoutAssignment).name || 'Unknown Workout',
      error: null
    };

    // Add validation before returning:
    if (!result.id) {
      throw new Error('Failed to construct valid server response');
    }

    // Commit transaction BEFORE returning
    await session.commitTransaction();
    // Removed console.log
    
    // Stringify here to ensure serialization
    const finalResponse = JSON.parse(JSON.stringify(result));
    // Removed console.log
    
    return finalResponse;
    
  } catch (error) {
    console.error('[Assignment] Database transaction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      workoutId,
      sessionStatus: session.id,  // Changed from session.state
      duration: Date.now() - startTime + 'ms'
    });
    await session.abortTransaction();
    console.error('[ASSIGN] Error al asignar rutina:', error);
    return {
      success: false,
      id: workoutId,
      assignedCoaches: [],
      assignedCustomers: [],
      name: '',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  } finally {
    session.endSession();
  }
}

/**
 * Duplica una rutina existente y la asigna a un usuario específico
 * Esta función combina duplicateWorkout y assignWorkoutToUser
 * @param workoutId ID de la rutina a duplicar
 * @param targetUserId ID del usuario al que se asignará la rutina duplicada
 * @param newName Nombre opcional para la rutina duplicada
 * @param newDescription Nueva descripción para la rutina duplicada
 * @returns La nueva rutina duplicada y asignada
 */
export async function duplicateAndAssignWorkout(
  workoutId: string, 
  data: { coachIds: string[]; customerIds: string[] }, 
  newName?: string
) {
  try {
    const duplicatedWorkout = await duplicateWorkout(workoutId, newName);
    
    // Return simplified response
    return {
      success: true,
      id: duplicatedWorkout.id,
      assignedCoaches: data.coachIds,
      assignedCustomers: data.customerIds,
      name: duplicatedWorkout.name,
      error: null
    };
  } catch (error) {
    console.error('Error duplicando y asignando rutina:', error);
    return {
      success: false,
      id: workoutId,
      assignedCoaches: [],
      assignedCustomers: [],
      name: '',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Actualiza el nombre de un día de rutina
 * @param workout Rutina a modificar
 * @param dayIndex Índice del día a actualizar
 * @param newName Nuevo nombre para el día
 */
export async function updateDayName(workout: WorkoutType, dayIndex: number, newName: string) {
  const session = await getServerSession(authOptions);
  console.log('Actualizando nombre del día:', {
    workoutId: workout.id,
    dayIndex,
    newName,
    userId: session?.user?.id
  });

  if (!session?.user?.id || !session?.user?.email) {
    // Removed console.log
    throw new Error('No autorizado');
  }

  // Verificar que el index es válido
  if (dayIndex < 0) {
    // Removed console.log
    throw new Error('Índice de día inválido');
  }

  await dbConnect();
  
  try {
    const workoutId = workout.id;
    
    if (!workoutId || !validateMongoId(workoutId)) {
      // Removed console.log
      throw new Error('ID de rutina inválido');
    }

    // Buscar la rutina en la base de datos
    const workoutDoc = await Workout.findOne({
      _id: new Types.ObjectId(workoutId),
      userId: session.user.id
    });

    if (!workoutDoc) {
      // Removed console.log
      throw new Error('Rutina no encontrada');
    }

    // Verificar que el día existe
    if (!workoutDoc.days || dayIndex >= workoutDoc.days.length) {
      // Removed console.log
      throw new Error('Día no encontrado');
    }

    // Actualizar el nombre del día
    workoutDoc.days[dayIndex].name = newName;
    
    // Guardar los cambios
    await workoutDoc.save();
    // Removed console.log
    
    // Revalidar caché
    revalidatePath(`workout-${workoutId}`);
    
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error actualizando nombre del día:', error);
    throw error;
  }
}

/**
 * Actualiza el nombre de un bloque de ejercicios
 * @param workout Rutina a modificar
 * @param dayIndex Índice del día que contiene el bloque
 * @param blockIndex Índice del bloque a actualizar
 * @param newName Nuevo nombre para el bloque
 */
export async function updateBlockName(
  workout: WorkoutType, 
  dayIndex: number, 
  blockIndex: number, 
  newName: string
) {
  const session = await getServerSession(authOptions);
  console.log('Actualizando nombre del bloque:', {
    workoutId: workout.id,
    dayIndex,
    blockIndex,
    newName,
    userId: session?.user?.id
  });

  if (!session?.user?.id) {
    // Removed console.log
    throw new Error('No autorizado');
  }

  // Verificar que los índices son válidos
  if (dayIndex < 0 || blockIndex < 0) {
    // Removed console.log
    throw new Error('Índices inválidos');
  }

  await dbConnect();
  
  try {
    const workoutId = workout.id;
    
    if (!workoutId || !validateMongoId(workoutId)) {
      // Removed console.log
      throw new Error('ID de rutina inválido');
    }

    // Buscar la rutina en la base de datos
    const workoutDoc = await Workout.findOne({
      _id: new Types.ObjectId(workoutId),
      userId: session.user.id
    });

    if (!workoutDoc) {
      // Removed console.log
      throw new Error('Rutina no encontrada');
    }

    // Verificar que el día existe
    if (!workoutDoc.days || dayIndex >= workoutDoc.days.length) {
      // Removed console.log
      throw new Error('Día no encontrado');
    }

    // Verificar que el bloque existe
    if (!workoutDoc.days[dayIndex].blocks || blockIndex >= workoutDoc.days[dayIndex].blocks.length) {
      // Removed console.log
      throw new Error('Bloque no encontrado');
    }

    // Actualizar el nombre del bloque
    workoutDoc.days[dayIndex].blocks[blockIndex].name = newName;
    
    // Guardar los cambios
    await workoutDoc.save();
    // Removed console.log
    
    // Revalidar caché
    revalidatePath(`workout-${workoutId}`);
    
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error actualizando nombre del bloque:', error);
    throw error;
  }
}

/**
 * Actualiza el nombre de una rutina
 * @param workoutId ID de la rutina
 * @param newName Nuevo nombre para la rutina
 * @param newDescription Nueva descripción para la rutina
 * @returns La rutina actualizada
 */
export async function updateWorkoutName(workoutId: string, newName: string, newDescription: string) {
  if (!workoutId || !newName) {
    throw new Error('Workout ID and new name are required');
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('No autorizado');
    }

    const workout = await Workout.findById(workoutId);
    if (!workout) {
      throw new Error('Rutina no encontrada');
    }

    // Verificar permisos
    const userRole = await getCurrentUserRole(session.user.id);
    const isAdmin = userRole === 'admin';
    const isCoach = userRole === 'coach';
    const isOwner = workout.userId.toString() === session.user.id;

    if (!isAdmin && !isCoach && !isOwner) {
      throw new Error('No tienes permiso para modificar esta rutina');
    }

    // Actualizar nombre y descripción
    workout.name = newName;
    workout.description = newDescription;
    await workout.save();

    // Serializar el objeto antes de devolverlo
    const serializedWorkout = JSON.parse(JSON.stringify(workout.toObject()));
    
    // Asegurarnos de que el ID esté disponible en ambos formatos
    if (serializedWorkout._id) {
      serializedWorkout.id = serializedWorkout._id.toString();
    }

    return serializedWorkout;
  } catch (error) {
    console.error('Error updating workout:', error);
    throw error;
  }
} 