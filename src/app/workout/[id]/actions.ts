'use server';

import { getServerSession } from 'next-auth';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Rutina } from '@/lib/models/workout';
import { Types } from 'mongoose';
import { getCurrentUserRole } from '@/lib/utils/permissions';
import User from '@/lib/models/user';
import { ObjectId } from 'mongodb';
import { sanitizeHtml } from '@/lib/utils/security';
import { Rutina as Workout, Exercise } from '@/types/models';
import { exerciseList } from '@/data/exercises';
import { BodyZone, bodyZones } from '@/lib/constants/bodyZones';
import mongoose from 'mongoose';

// Helper function to validate MongoDB ObjectId
function validateMongoId(id: string): boolean {
  return Types.ObjectId.isValid(id);
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
    const workout = await Rutina.findOne({
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

    revalidateTag(`workout-${workoutId}`);
    return JSON.parse(JSON.stringify(workout.toObject()));
  } catch (error) {
    console.error('Error adding day:', error);
    throw error;
  }
}

export async function addBlock(workout: Workout, dayIndex: number) {
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
    console.log('Authorization failed: No user session');
    throw new Error('No autorizado');
  }

  // En este caso no necesitamos verificar el rol, pero podríamos hacerlo
  // para acciones más restrictivas
  // const userRole = await getCurrentUserRole(session.user.email);
  // console.log('Current user role:', { email: session.user.email, role: userRole });

  if (dayIndex < 0) {
    console.log('Invalid day index:', dayIndex);
    throw new Error('Invalid day index');
  }

  await dbConnect();
  console.log('Database connected');

  try {
    const workoutId = workout.id;
    console.log('Using workout ID:', workoutId);

    if (!workoutId) {
      console.log('Invalid workout ID - undefined or null');
      throw new Error('Invalid workout ID');
    }

    if (!validateMongoId(workoutId)) {
      console.log('Invalid MongoDB ObjectId format:', workoutId);
      throw new Error('Invalid workout ID format');
    }

    console.log('Searching for workout with criteria:', {
      _id: workoutId,
      userId: session.user.id
    });

    const workoutDoc = await Rutina.findOne({
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
      console.log('Workout not found in database');
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
    console.log('Generated random exercises:', randomExercises);

    const newBlock = {
      name: `Bloque ${workoutDoc.days[dayIndex].blocks.length + 1}`,
      exercises: randomExercises
    };
    console.log('Creating new block:', newBlock);

    workoutDoc.days[dayIndex].blocks.push(newBlock);
    console.log('Block added to day, saving document...');

    await workoutDoc.save();
    console.log('Workout document saved successfully');

    revalidateTag(`workout-${workoutId}`);
    console.log('Cache revalidated');

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

export async function addExercise(workout: Workout, dayIndex: number, blockIndex: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  await dbConnect();
  try {
    const workoutDoc = await Rutina.findOne({
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

    revalidateTag(`workout-${workout.id}`);
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw error;
  }
}

export async function updateExercise(
  workout: Workout,
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
    const workoutDoc = await Rutina.findOne({
      _id: new Types.ObjectId(workout.id),
      userId: session.user.id.toString()
    });

    if (!workoutDoc) throw new Error('Workout not found');

    const exercise = workoutDoc.days[dayIndex].blocks[blockIndex].exercises[exerciseIndex];
    Object.assign(exercise, data);
    await workoutDoc.save();

    revalidateTag(`workout-${workout.id}`);
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }
}

export async function deleteExercise(
  workout: Workout,
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
    const workoutDoc = await Rutina.findOne({
      _id: new Types.ObjectId(workout.id),
      userId: session.user.id.toString()
    });

    if (!workoutDoc) throw new Error('Workout not found');

    workoutDoc.days[dayIndex].blocks[blockIndex].exercises.splice(exerciseIndex, 1);
    await workoutDoc.save();

    revalidateTag(`workout-${workout.id}`);
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
}

export async function deleteDay(workout: Workout, dayIndex: number) {
  console.log('Server action: deleteDay started', {
    workoutId: workout.id || workout._id?.toString(),
    dayIndex
  });

  await dbConnect();
  try {
    const workoutDoc = await Rutina.findOne({
      _id: new Types.ObjectId(workout.id),
      userId: workout.userId.toString()
    });

    if (!workoutDoc) throw new Error('Workout not found');

    workoutDoc.days.splice(dayIndex, 1);
    await workoutDoc.save();

    console.log('Day deleted successfully, revalidating tags...');
    
    // Revalidate both the specific workout and the list
    revalidateTag(`workout-${workout.id}`);
    revalidateTag('workouts-list');
    
    console.log('Tags revalidated');
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error in deleteDay action:', error);
    throw error;
  }
}

export async function deleteBlock(workout: Workout, dayIndex: number, blockIndex: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  await dbConnect();
  try {
    const workoutDoc = await Rutina.findOne({
      _id: new Types.ObjectId(workout.id),
      userId: session.user.id.toString()
    });

    if (!workoutDoc) throw new Error('Workout not found');

    workoutDoc.days[dayIndex].blocks.splice(blockIndex, 1);
    await workoutDoc.save();

    revalidateTag(`workout-${workout.id}`);
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

  console.log('Server action: deleteWorkout started', { workoutId, userId });

  await dbConnect();
  try {
    console.log('Connecting to database...');
    const result = await Rutina.findOneAndDelete({
      _id: new Types.ObjectId(workoutId),
      userId: userId.toString()
    });

    if (!result) {
      console.error('Workout not found');
      throw new Error('Workout not found');
    }

    console.log('Workout deleted successfully, revalidating tags...');
    
    // Revalidate both the specific workout and the workouts list
    revalidateTag(`workout-${workoutId}`);
    revalidateTag('workouts-list');
    
    // Wait a moment to ensure revalidation is processed
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log('Tags revalidated');
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
export async function duplicateWorkout(workoutId: string, newName?: string) {
  console.log(`[SECURITY] Intento de duplicación de workout. ID: ${workoutId}, Tipo: ${typeof workoutId}, Longitud: ${workoutId?.length}`);
  
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
    const originalWorkout = await Rutina.findById(workoutId);
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
    const sanitizedDescription = sanitizeHtml(originalWorkout.description);
    
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
    const newWorkout = new Rutina({
      ...workoutData,
      name: newName ? sanitizedName : `${sanitizedName} (Copia)`,
      description: sanitizedDescription,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Guardar el nuevo workout
    await newWorkout.save();
    
    console.log(`[INFO] Workout duplicado exitosamente. Original: ${workoutId}, Nuevo: ${newWorkout.id}`);
    
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
      
      console.log('[INFO] Workout serializado correctamente');
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
      
      console.log('[INFO] Usando objeto de respaldo simplificado');
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
export async function assignWorkoutToUser(workoutId: string, targetUserId: string) {
  try {
    console.log('[ASSIGN] Inicio de asignación. workoutId:', workoutId, 'targetUserId:', targetUserId);
    
    // Validar los IDs
    if (!workoutId || !targetUserId) {
      console.error('[ASSIGN] Error: IDs faltantes', { workoutId, targetUserId });
      throw new Error('IDs inválidos o faltantes');
    }
    
    // Comprobar si los IDs son strings
    if (typeof workoutId !== 'string' || typeof targetUserId !== 'string') {
      console.error('[ASSIGN] Error: Los IDs deben ser strings', { 
        workoutIdType: typeof workoutId, 
        targetUserIdType: typeof targetUserId 
      });
      throw new Error('Los IDs deben ser strings');
    }
    
    // Validar formato de ID de MongoDB
    if (!validateMongoId(workoutId)) {
      console.error('[ASSIGN] Error: workoutId no es un ID de MongoDB válido', { workoutId });
      throw new Error('ID de rutina inválido');
    }
    
    if (!validateMongoId(targetUserId)) {
      console.error('[ASSIGN] Error: targetUserId no es un ID de MongoDB válido', { targetUserId });
      throw new Error('ID de usuario inválido');
    }
    
    // Obtener sesión
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error('[ASSIGN] Error: No hay sesión de usuario');
      throw new Error('No autorizado');
    }
    
    await dbConnect();
    
    // Obtener la rutina original
    const originalWorkout = await Rutina.findById(workoutId);
    if (!originalWorkout) {
      console.error('[ASSIGN] Error: Rutina no encontrada', { workoutId });
      throw new Error('Rutina no encontrada');
    }
    
    // Verificar que el usuario objetivo existe
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      console.error('[ASSIGN] Error: Usuario destino no encontrado', { targetUserId });
      throw new Error('Usuario destino no encontrado');
    }
    
    // Verificar que el usuario actual es el propietario de la rutina o es admin
    const userRole = await getCurrentUserRole(session.user.email || '');
    const isAdmin = userRole === 'admin';
    const isCoach = userRole === 'coach' || isAdmin;
    
    if (originalWorkout.userId.toString() !== session.user.id && !isAdmin && !isCoach) {
      console.error('[ASSIGN] Error: Usuario no autorizado', { 
        currentUserId: session.user.id, 
        workoutOwnerId: originalWorkout.userId.toString() 
      });
      throw new Error('No autorizado para asignar esta rutina');
    }
    
    // Duplicar la rutina para el usuario destino
    console.log('[ASSIGN] Duplicando rutina para usuario destino');
    const workoutData = originalWorkout.toObject();
    delete workoutData._id;
    
    // Crear una nueva rutina para el usuario destino
    const newWorkout = new Rutina({
      ...workoutData,
      userId: targetUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Guardar la nueva rutina
    await newWorkout.save();
    console.log('[ASSIGN] Rutina duplicada y asignada exitosamente. Nueva rutina ID:', newWorkout._id);
    
    // Convertir a objeto serializable
    const serializedWorkout = JSON.parse(JSON.stringify(newWorkout.toObject()));
    serializedWorkout.id = serializedWorkout._id.toString();
    
    return serializedWorkout;
  } catch (error) {
    console.error('[ASSIGN] Error al asignar rutina:', error);
    throw error;
  }
}

/**
 * Duplica una rutina existente y la asigna a un usuario específico
 * Esta función combina duplicateWorkout y assignWorkoutToUser
 * @param workoutId ID de la rutina a duplicar
 * @param targetUserId ID del usuario al que se asignará la rutina duplicada
 * @param newName Nombre opcional para la rutina duplicada
 * @returns La nueva rutina duplicada y asignada
 */
export async function duplicateAndAssignWorkout(workoutId: string, targetUserId: string, newName?: string) {
  const session = await getServerSession(authOptions);
  console.log('Iniciando duplicación y asignación de rutina:', {
    workoutId,
    targetUserId,
    newName,
    requesterEmail: session?.user?.email,
    requesterUserId: session?.user?.id
  });

  if (!session?.user?.id || !session?.user?.email) {
    console.log('No autorizado para duplicar y asignar rutina');
    throw new Error('No autorizado');
  }

  await dbConnect();

  try {
    // Primero duplicamos la rutina (se crea una copia asignada al usuario actual)
    const duplicatedWorkout = await duplicateWorkout(workoutId, newName);
    
    // Luego asignamos la rutina duplicada al usuario destino
    const assignedWorkout = await Rutina.findByIdAndUpdate(
      duplicatedWorkout._id,
      { 
        userId: targetUserId,
        name: newName || duplicatedWorkout.name,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!assignedWorkout) {
      throw new Error('Error al asignar la rutina duplicada');
    }

    // Revalidar caché
    revalidateTag(`workout-${assignedWorkout._id}`);
    revalidateTag('workouts-list');
    
    console.log('Rutina duplicada y asignada exitosamente');
    return JSON.parse(JSON.stringify(assignedWorkout.toObject()));
  } catch (error) {
    console.error('Error duplicando y asignando rutina:', error);
    throw error;
  }
}

/**
 * Actualiza el nombre de un día de rutina
 * @param workout Rutina a modificar
 * @param dayIndex Índice del día a actualizar
 * @param newName Nuevo nombre para el día
 */
export async function updateDayName(workout: Workout, dayIndex: number, newName: string) {
  const session = await getServerSession(authOptions);
  console.log('Actualizando nombre del día:', {
    workoutId: workout.id,
    dayIndex,
    newName,
    userId: session?.user?.id
  });

  if (!session?.user?.id || !session?.user?.email) {
    console.log('No autorizado para actualizar nombre del día');
    throw new Error('No autorizado');
  }

  // Verificar que el index es válido
  if (dayIndex < 0) {
    console.log('Índice de día inválido:', dayIndex);
    throw new Error('Índice de día inválido');
  }

  await dbConnect();
  
  try {
    const workoutId = workout.id;
    
    if (!workoutId || !validateMongoId(workoutId)) {
      console.log('ID de rutina inválido:', workoutId);
      throw new Error('ID de rutina inválido');
    }

    // Buscar la rutina en la base de datos
    const workoutDoc = await Rutina.findOne({
      _id: new Types.ObjectId(workoutId),
      userId: session.user.id
    });

    if (!workoutDoc) {
      console.log('Rutina no encontrada');
      throw new Error('Rutina no encontrada');
    }

    // Verificar que el día existe
    if (!workoutDoc.days || dayIndex >= workoutDoc.days.length) {
      console.log('Día no encontrado');
      throw new Error('Día no encontrado');
    }

    // Actualizar el nombre del día
    workoutDoc.days[dayIndex].name = newName;
    
    // Guardar los cambios
    await workoutDoc.save();
    console.log('Nombre del día actualizado exitosamente');
    
    // Revalidar caché
    revalidateTag(`workout-${workoutId}`);
    
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
  workout: Workout, 
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
    console.log('No autorizado para actualizar nombre del bloque');
    throw new Error('No autorizado');
  }

  // Verificar que los índices son válidos
  if (dayIndex < 0 || blockIndex < 0) {
    console.log('Índices inválidos:', { dayIndex, blockIndex });
    throw new Error('Índices inválidos');
  }

  await dbConnect();
  
  try {
    const workoutId = workout.id;
    
    if (!workoutId || !validateMongoId(workoutId)) {
      console.log('ID de rutina inválido:', workoutId);
      throw new Error('ID de rutina inválido');
    }

    // Buscar la rutina en la base de datos
    const workoutDoc = await Rutina.findOne({
      _id: new Types.ObjectId(workoutId),
      userId: session.user.id
    });

    if (!workoutDoc) {
      console.log('Rutina no encontrada');
      throw new Error('Rutina no encontrada');
    }

    // Verificar que el día existe
    if (!workoutDoc.days || dayIndex >= workoutDoc.days.length) {
      console.log('Día no encontrado');
      throw new Error('Día no encontrado');
    }

    // Verificar que el bloque existe
    if (!workoutDoc.days[dayIndex].blocks || blockIndex >= workoutDoc.days[dayIndex].blocks.length) {
      console.log('Bloque no encontrado');
      throw new Error('Bloque no encontrado');
    }

    // Actualizar el nombre del bloque
    workoutDoc.days[dayIndex].blocks[blockIndex].name = newName;
    
    // Guardar los cambios
    await workoutDoc.save();
    console.log('Nombre del bloque actualizado exitosamente');
    
    // Revalidar caché
    revalidateTag(`workout-${workoutId}`);
    
    return JSON.parse(JSON.stringify(workoutDoc.toObject()));
  } catch (error) {
    console.error('Error actualizando nombre del bloque:', error);
    throw error;
  }
}

/**
 * Asigna una rutina a un usuario
 * Primero duplica la rutina y luego la asigna al usuario destino
 */
export async function assignWorkout(workoutId: string, targetUserId: string, newName: string) {
  try {
    // Primero duplicamos la rutina (se crea una copia asignada al usuario actual)
    const duplicatedWorkout = await duplicateWorkout(workoutId, newName);
    
    // Luego asignamos la rutina duplicada al usuario destino
    const assignedWorkout = await Rutina.findByIdAndUpdate(
      duplicatedWorkout._id,
      { 
        userId: targetUserId,
        name: newName || duplicatedWorkout.name,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return assignedWorkout;
  } catch (error) {
    console.error('Error assigning workout:', error);
    throw error;
  }
}

/**
 * Actualiza el nombre de una rutina
 * @param workoutId ID de la rutina
 * @param newName Nuevo nombre para la rutina
 * @returns La rutina actualizada
 */
export async function updateWorkoutName(workoutId: string, newName: string) {
  try {
    // Validar que el ID de la rutina sea proporcionado
    if (!workoutId) {
      throw new Error('ID de rutina no definido');
    }
    
    // Validar que el nombre no esté vacío
    if (!newName || !newName.trim()) {
      throw new Error('El nombre de la rutina no puede estar vacío');
    }
    
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error('No autorizado');
    }
    
    // Conectar a la base de datos
    await dbConnect();
    
    // Buscar la rutina
    const workout = await Rutina.findById(workoutId);
    if (!workout) {
      throw new Error('Rutina no encontrada');
    }
    
    // Verificar que el usuario es propietario o admin
    const userRole = await getCurrentUserRole(session.user.email || '');
    const isAdmin = userRole === 'admin';
    
    if (workout.userId.toString() !== session.user.id && !isAdmin) {
      throw new Error('No autorizado para modificar esta rutina');
    }
    
    // Sanitizar el nombre
    const sanitizedName = sanitizeHtml(newName.trim());
    
    // Actualizar el nombre
    workout.name = sanitizedName;
    workout.updatedAt = new Date();
    
    // Guardar los cambios
    await workout.save();
    
    // Revalidar caché
    revalidateTag(`workout-${workoutId}`);
    revalidateTag('workouts-list');
    
    // Convertir a objeto plano
    const serializedWorkout = JSON.parse(JSON.stringify(workout.toObject()));
    
    return serializedWorkout;
  } catch (error) {
    console.error('Error al actualizar el nombre de la rutina:', error);
    throw error;
  }
} 