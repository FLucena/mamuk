'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';
import { Types } from 'mongoose';
import { getCurrentUserRole, getCurrentUserRoles } from '@/lib/utils/permissions';
import User from '@/lib/models/user';
import { ObjectId } from 'mongodb';
import { sanitizeHtml, validateMongoId } from '@/lib/utils/security';
import { Workout as WorkoutType, Exercise } from '@/types/models';
import { exerciseList } from '@/data/exercises';
import { BodyZone } from '@/lib/constants/bodyZones';
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
    // Find by ID first, then verify ownership
    const workout = await (Workout.findById as any)(new Types.ObjectId(workoutId));

    if (!workout) throw new Error('Workout not found');
    
    // Check if the user has permission to modify this workout
    const workoutUserId = String(workout.userId);
    const requestUserId = String(userId);
    
    if (workoutUserId !== requestUserId) {
      // Also allow if user is an admin or coach
      const userRoles = await getCurrentUserRoles(userId);
      const isAdminOrCoach = userRoles.includes('admin') || userRoles.includes('coach');
      
      if (!isAdminOrCoach) {
        throw new Error('No tienes permiso para modificar esta rutina');
      }
    }

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
    throw new Error('No autorizado');
  }

  if (dayIndex < 0) {
    throw new Error('Invalid day index');
  }

  await dbConnect();

  try {
    const workoutId = workout.id;

    // Improved ID validation
    if (!workoutId || typeof workoutId !== 'string' || workoutId.trim() === '') {
      console.error('Invalid workout ID - missing or empty:', { workoutId });
      throw new Error('Invalid workout ID');
    }

    // Try/catch the validation to provide better error details
    try {
      if (!validateMongoId(workoutId)) {
        console.error('Invalid workout ID format:', { workoutId });
        throw new Error('Invalid workout ID format');
      }
    } catch (validationError) {
      console.error('Error validating workout ID:', { workoutId, error: validationError });
      throw new Error(`Invalid workout ID: ${workoutId}`);
    }

    console.log('Searching for workout with criteria:', {
      _id: workoutId
    });

    // Find the workout using only the ID and then verify ownership in code
    // This avoids the ObjectId casting error for userId field
    const workoutDoc = await (Workout.findById as any)(new Types.ObjectId(workoutId));

    if (!workoutDoc) {
      throw new Error('Workout not found');
    }
    
    // Check if the user has permission to modify this workout
    // Convert both IDs to strings for comparison to avoid type issues
    const workoutUserId = String(workoutDoc.userId);
    const sessionUserId = String(session.user.id);
    
    console.log('Comparing userIds:', {
      workoutUserId,
      sessionUserId,
      match: workoutUserId === sessionUserId
    });
    
    if (workoutUserId !== sessionUserId) {
      // Also allow if user is an admin or coach
      const userRoles = await getCurrentUserRoles(session.user.id);
      const isAdminOrCoach = userRoles.includes('admin') || userRoles.includes('coach');
      
      // If not admin/coach and not the owner, deny access
      if (!isAdminOrCoach) {
        throw new Error('No tienes permiso para modificar esta rutina');
      }
    }

    console.log('Workout document found:', {
      found: !!workoutDoc,
      daysCount: workoutDoc?.days?.length,
      requestedDayIndex: dayIndex,
      dayInfo: workoutDoc?.days?.[dayIndex] ? {
        name: workoutDoc.days[dayIndex].name,
        blocksCount: workoutDoc.days[dayIndex].blocks.length
      } : null
    });

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

    const newBlock = {
      name: `Bloque ${workoutDoc.days[dayIndex].blocks.length + 1}`,
      exercises: randomExercises
    };

    workoutDoc.days[dayIndex].blocks.push(newBlock);

    await workoutDoc.save();

    revalidatePath(`workout-${workoutId}`);

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
    // Find by ID first, then verify ownership - avoids ObjectId casting errors
    const workoutDoc = await (Workout.findById as any)(new Types.ObjectId(workout.id));

    if (!workoutDoc) throw new Error('Workout not found');
    
    // Check if the user has permission to modify this workout
    const workoutUserId = String(workoutDoc.userId);
    const sessionUserId = String(session.user.id);
    
    if (workoutUserId !== sessionUserId) {
      // Also allow if user is an admin or coach
      const userRoles = await getCurrentUserRoles(session.user.id);
      const isAdminOrCoach = userRoles.includes('admin') || userRoles.includes('coach');
      
      if (!isAdminOrCoach) {
        throw new Error('No tienes permiso para modificar esta rutina');
      }
    }

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
    // Find by ID first, then verify ownership
    const workoutDoc = await (Workout.findById as any)(new Types.ObjectId(workout.id));

    if (!workoutDoc) throw new Error('Workout not found');
    
    // Check if the user has permission to modify this workout
    const workoutUserId = String(workoutDoc.userId);
    const sessionUserId = String(session.user.id);
    
    if (workoutUserId !== sessionUserId) {
      // Also allow if user is an admin or coach
      const userRoles = await getCurrentUserRoles(session.user.id);
      const isAdminOrCoach = userRoles.includes('admin') || userRoles.includes('coach');
      
      if (!isAdminOrCoach) {
        throw new Error('No tienes permiso para modificar esta rutina');
      }
    }

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
    // Find by ID first, then verify ownership - avoids ObjectId casting errors
    const workoutDoc = await (Workout.findById as any)(new Types.ObjectId(workout.id));

    if (!workoutDoc) throw new Error('Workout not found');
    
    // Check if the user has permission to modify this workout
    const workoutUserId = String(workoutDoc.userId);
    const sessionUserId = String(session.user.id);
    
    if (workoutUserId !== sessionUserId) {
      // Also allow if user is an admin or coach
      const userRoles = await getCurrentUserRoles(session.user.id);
      const isAdminOrCoach = userRoles.includes('admin') || userRoles.includes('coach');
      
      if (!isAdminOrCoach) {
        throw new Error('No tienes permiso para modificar esta rutina');
      }
    }

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

  // Get session for user validation
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  await dbConnect();
  try {
    // Find by ID first, then verify ownership
    const workoutDoc = await (Workout.findById as any)(new Types.ObjectId(workout.id));

    if (!workoutDoc) throw new Error('Workout not found');
    
    // Check if the user has permission to modify this workout
    const workoutUserId = String(workoutDoc.userId);
    const sessionUserId = String(session.user.id);
    
    if (workoutUserId !== sessionUserId) {
      // Also allow if user is an admin or coach
      const userRoles = await getCurrentUserRoles(session.user.id);
      const isAdminOrCoach = userRoles.includes('admin') || userRoles.includes('coach');
      
      if (!isAdminOrCoach) {
        throw new Error('No tienes permiso para modificar esta rutina');
      }
    }

    workoutDoc.days.splice(dayIndex, 1);
    await workoutDoc.save();
    
    // Revalidate both the specific workout and the list
    revalidatePath(`workout-${workout.id}`);
    revalidatePath('workouts-list');
    
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
    // Find by ID first, then verify ownership
    const workoutDoc = await (Workout.findById as any)(new Types.ObjectId(workout.id));

    if (!workoutDoc) throw new Error('Workout not found');
    
    // Check if the user has permission to modify this workout
    const workoutUserId = String(workoutDoc.userId);
    const sessionUserId = String(session.user.id);
    
    if (workoutUserId !== sessionUserId) {
      // Also allow if user is an admin or coach
      const userRoles = await getCurrentUserRoles(session.user.id);
      const isAdminOrCoach = userRoles.includes('admin') || userRoles.includes('coach');
      
      if (!isAdminOrCoach) {
        throw new Error('No tienes permiso para modificar esta rutina');
      }
    }

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

  console.log('Starting delete workout process:', { workoutId, userId });

  await dbConnect();
  try {
    // Find workout first by ID only, avoiding casting the userId
    const workout = await (Workout.findById as any)(new Types.ObjectId(workoutId));
    
    if (!workout) {
      console.error('Workout not found');
      throw new Error('Workout not found');
    }
    
    // Check if the user has permission to delete this workout
    // Convert both IDs to strings for comparison to avoid type issues
    const workoutUserId = String(workout.userId);
    const requestUserId = String(userId);
    
    console.log('Comparing userIds for delete permission:', { workoutUserId, requestUserId });
    
    if (workoutUserId !== requestUserId) {
      // Allow admins and coaches to delete workouts they don't own
      const userRoles = await getCurrentUserRoles(userId);
      const isAdminOrCoach = userRoles.includes('admin') || userRoles.includes('coach');
      
      if (!isAdminOrCoach) {
        console.error('User not authorized to delete this workout');
        throw new Error('No tienes permiso para eliminar esta rutina');
      }
    }
    
    // Now delete the workout
    await (Workout.findByIdAndDelete as any)(new Types.ObjectId(workoutId));
    console.log('Workout deleted successfully:', workoutId);
    
    // Revalidate both the specific workout and the workouts list
    revalidatePath('/workout');
    revalidatePath(`/workout/${workoutId}`);
    revalidatePath('/api/workout');
    
    console.log('[Deletion] Revalidating paths:', {
      paths: ['/workout', `/workout/${workoutId}`, '/api/workout']
    });

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
  console.log('[Duplication] Starting workout duplication process:', { workoutId, newName });
  
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

    // Check workout limit before proceeding
    const limitCheck = await checkWorkoutLimit(session.user.id);
    if (!limitCheck.canCreate) {
      console.error('[Duplication] User has reached workout limit:', {
        userId: session.user.id,
        currentCount: limitCheck.currentCount,
        maxAllowed: limitCheck.maxAllowed
      });
      throw new Error('Has alcanzado el límite de rutinas personales');
    }
    
    // Log user information for debugging
    console.log('[Duplication] Session info:', { 
      userId: session.user.id,
      userIdType: typeof session.user.id,
      email: session.user.email
    });

    // Find the user first to get their MongoDB ID
    let userQuery;
    if (Types.ObjectId.isValid(session.user.id)) {
      userQuery = { _id: new Types.ObjectId(session.user.id) };
    } else if (session.user.email) {
      userQuery = { email: session.user.email };
    } else {
      userQuery = { sub: session.user.id };
    }

    const user = await (User.findOne as any)(userQuery).lean();

    if (!user) {
      console.error('[Duplication] User not found:', { 
        userId: session.user.id,
        query: userQuery 
      });
      throw new Error('Usuario no encontrado');
    }

    console.log('[Duplication] User found:', {
      userId: user._id.toString(),
      roles: user.roles,
      email: user.email,
      sub: user.sub
    });
    
    // Verificar el rol del usuario
    const userRole = await getCurrentUserRole(session.user.email || '');
    const isAdmin = userRole === 'admin';
    const isCoach = userRole === 'coach';
    
    // Obtener el workout original
    const originalWorkout = await (Workout.findById as any)(workoutId);
    if (!originalWorkout) {
      console.error(`[SECURITY] Intento de duplicación de workout inexistente. ID: ${workoutId}`);
      throw new Error('Rutina no encontrada');
    }

    console.log('[Duplication] Workout found:', {
      workoutId: originalWorkout._id.toString(),
      workoutName: originalWorkout.name,
      workoutOwner: originalWorkout.userId.toString(),
      assignedCustomers: originalWorkout.assignedCustomers?.length || 0,
      assignedCoaches: originalWorkout.assignedCoaches?.length || 0
    });
    
    // Check if user is assigned to this workout
    const isAssignedCustomer = originalWorkout.assignedCustomers && 
      Array.isArray(originalWorkout.assignedCustomers) && 
      originalWorkout.assignedCustomers.some((customerId: Types.ObjectId | string) => {
        const customerIdStr = customerId instanceof Types.ObjectId ? customerId.toString() : customerId;
        const isAssigned = customerIdStr === user._id.toString();
        console.log('[Duplication] Checking customer assignment:', {
          customerId: customerIdStr,
          userId: user._id.toString(),
          isAssigned
        });
        return isAssigned;
      });

    // Check if user is an assigned coach
    const isAssignedCoach = originalWorkout.assignedCoaches && 
      Array.isArray(originalWorkout.assignedCoaches) && 
      originalWorkout.assignedCoaches.some((coachId: Types.ObjectId | string) => {
        const coachIdStr = coachId instanceof Types.ObjectId ? coachId.toString() : coachId;
        const isAssigned = coachIdStr === user._id.toString();
        console.log('[Duplication] Checking coach assignment:', {
          coachId: coachIdStr,
          userId: user._id.toString(),
          isAssigned
        });
        return isAssigned;
      });

    const isOwner = originalWorkout.userId.toString() === user._id.toString();

    console.log('[Duplication] Permission check summary:', {
      isAdmin,
      isCoach,
      isOwner,
      isAssignedCustomer,
      isAssignedCoach,
      workoutOwner: originalWorkout.userId.toString(),
      userId: user._id.toString()
    });

    // Verificar que el usuario tenga permisos para duplicar
    if (!isAdmin && !isCoach && !isOwner && !isAssignedCustomer && !isAssignedCoach) {
      console.error('[Duplication] Permission denied:', {
        userId: user._id.toString(),
        workoutId,
        isAdmin,
        isCoach,
        isOwner,
        isAssignedCustomer,
        isAssignedCoach
      });
      throw new Error('No autorizado para duplicar esta rutina');
    }
    
    // Sanitizar los datos antes de duplicar
    const sanitizedName = sanitizeHtml(newName || `${originalWorkout.name} (Copia)`);
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
      if ('_id' in newDay) {
        delete newDay._id;
      }
      
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
        if ('_id' in newBlock) {
          delete newBlock._id;
        }
        
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
          if ('_id' in newExercise) {
            delete newExercise._id;
          }
          
          return newExercise;
        });
        
        return newBlock;
      });
      
      return newDay;
    });
    
    // Crear la nueva rutina
    const newWorkout = await (Workout.create as any)({
      ...workoutData,
      name: sanitizedName,
      description: sanitizedDescription,
      userId: user._id,  // Use the MongoDB ObjectId from the user document
      createdBy: user._id, // Ensure createdBy is also a valid ObjectId
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedCustomers: [user._id], // Assign to the current user
      assignedCoaches: [], // Clear assigned coaches
    });
    
    // Log the new workout before saving
    console.log('[Duplication] New workout created:', {
      id: newWorkout._id,
      name: newWorkout.name,
      userId: newWorkout.userId
    });
    
    // Convertir el objeto Mongoose a un objeto plano para que sea serializable
    const serializedWorkout = JSON.parse(JSON.stringify(newWorkout.toObject()));
    
    // Asegurarnos de que el ID esté disponible en ambos formatos
    if (serializedWorkout._id) {
      serializedWorkout.id = serializedWorkout._id.toString();
    }
    
    console.log('[Duplication] Serialized workout result:', { 
      id: serializedWorkout.id,
      name: serializedWorkout.name
    });
    
    // Revalidate both the specific workout and the workouts list
    revalidatePath('/workout');
    revalidatePath(`/workout/${serializedWorkout.id}`);
    revalidatePath('/api/workout');
    
    console.log('[Duplication] Revalidating paths:', {
      paths: ['/workout', `/workout/${serializedWorkout.id}`, '/api/workout']
    });

    return serializedWorkout;
  } catch (error) {
    console.error('[Duplication] Error:', {
      workoutId,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error'
    });
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

    const updatedWorkout = await (Workout.findByIdAndUpdate as any)(
      workoutId,
      {
        $addToSet: {
          assignedCoaches: { $each: data.coachIds.map(id => new Types.ObjectId(id)) },
          assignedCustomers: { $each: data.customerIds.map(id => new Types.ObjectId(id)) }
        }
      },
      { new: true, runValidators: true, session }
    ).lean() as WorkoutAssignment;

    if (!updatedWorkout) {
      throw new Error('Workout no encontrado o actualización fallida');
    }

    // 2. Update user documents
    const updateOperations = [
      ...data.coachIds.map(userId => 
        (User.findByIdAndUpdate as any)(
          userId,
          { $addToSet: { coachedWorkouts: workoutId } },
          { session }
        )
      ),
      ...data.customerIds.map(userId => 
        (User.findByIdAndUpdate as any)(
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
    
    // Revalidate both the specific workout and the workouts list
    revalidatePath('/workout');
    revalidatePath(`/workout/${workoutId}`);
    revalidatePath('/api/workout');
    
    console.log('[Assignment] Revalidating paths:', {
      paths: ['/workout', `/workout/${workoutId}`, '/api/workout']
    });

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
    throw new Error('No autorizado');
  }

  // Verificar que el index es válido
  if (dayIndex < 0) {
    throw new Error('Índice de día inválido');
  }

  await dbConnect();
  
  try {
    const workoutId = workout.id;
    
    if (!workoutId || !validateMongoId(workoutId)) {
      throw new Error('ID de rutina inválido');
    }

    // Find by ID first, then verify ownership
    const workoutDoc = await (Workout.findById as any)(new Types.ObjectId(workoutId));

    if (!workoutDoc) throw new Error('Workout not found');
    
    // Check if the user has permission to modify this workout
    const workoutUserId = String(workoutDoc.userId);
    const sessionUserId = String(session.user.id);
    
    if (workoutUserId !== sessionUserId) {
      // Also allow if user is an admin or coach
      const userRoles = await getCurrentUserRoles(session.user.id);
      const isAdminOrCoach = userRoles.includes('admin') || userRoles.includes('coach');
      
      if (!isAdminOrCoach) {
        throw new Error('No tienes permiso para modificar esta rutina');
      }
    }

    // Verificar que el día existe
    if (!workoutDoc.days || dayIndex >= workoutDoc.days.length) {
      throw new Error('Día no encontrado');
    }

    // Actualizar el nombre del día
    workoutDoc.days[dayIndex].name = newName;
    
    // Guardar los cambios
    await workoutDoc.save();
    
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
    throw new Error('No autorizado');
  }

  // Verificar que los índices son válidos
  if (dayIndex < 0 || blockIndex < 0) {
    throw new Error('Índices inválidos');
  }

  await dbConnect();
  
  try {
    const workoutId = workout.id;
    
    if (!workoutId || !validateMongoId(workoutId)) {
      throw new Error('ID de rutina inválido');
    }

    // Find by ID first, then verify ownership
    const workoutDoc = await (Workout.findById as any)(new Types.ObjectId(workoutId));

    if (!workoutDoc) throw new Error('Workout not found');
    
    // Check if the user has permission to modify this workout
    const workoutUserId = String(workoutDoc.userId);
    const sessionUserId = String(session.user.id);
    
    if (workoutUserId !== sessionUserId) {
      // Also allow if user is an admin or coach
      const userRoles = await getCurrentUserRoles(session.user.id);
      const isAdminOrCoach = userRoles.includes('admin') || userRoles.includes('coach');
      
      if (!isAdminOrCoach) {
        throw new Error('No tienes permiso para modificar esta rutina');
      }
    }

    // Verificar que el día existe
    if (!workoutDoc.days || dayIndex >= workoutDoc.days.length) {
      throw new Error('Día no encontrado');
    }

    // Verificar que el bloque existe
    if (!workoutDoc.days[dayIndex].blocks || blockIndex >= workoutDoc.days[dayIndex].blocks.length) {
      throw new Error('Bloque no encontrado');
    }

    // Actualizar el nombre del bloque
    workoutDoc.days[dayIndex].blocks[blockIndex].name = newName;
    
    // Guardar los cambios
    await workoutDoc.save();
    
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
  console.log('[updateWorkoutName] Starting update:', {
    workoutId,
    newName,
    newDescription,
    timestamp: new Date().toISOString()
  });

  if (!workoutId || !newName) {
    console.error('[updateWorkoutName] Missing required fields:', {
      hasWorkoutId: !!workoutId,
      hasNewName: !!newName
    });
    throw new Error('Workout ID and new name are required');
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('[updateWorkoutName] No authenticated session');
      throw new Error('No autorizado');
    }

    console.log('[updateWorkoutName] Session info:', {
      userId: session.user.id,
      userEmail: session.user.email
    });

    // Find the user first to get their MongoDB ID
    let userQuery;
    if (Types.ObjectId.isValid(session.user.id)) {
      userQuery = { _id: new Types.ObjectId(session.user.id) };
    } else if (session.user.email) {
      userQuery = { email: session.user.email };
    } else {
      userQuery = { sub: session.user.id };
    }

    const user = await (User.findOne as any)(userQuery).lean();

    if (!user) {
      console.error('[updateWorkoutName] User not found:', { 
        userId: session.user.id,
        query: userQuery 
      });
      throw new Error('Usuario no encontrado');
    }

    console.log('[updateWorkoutName] User found:', {
      userId: user._id.toString(),
      roles: user.roles,
      email: user.email,
      sub: user.sub
    });

    console.log('[updateWorkoutName] Finding workout:', { workoutId });
    const workout = await (Workout.findById as any)(workoutId);
    if (!workout) {
      console.error('[updateWorkoutName] Workout not found:', { workoutId });
      throw new Error('Rutina no encontrada');
    }

    console.log('[updateWorkoutName] Workout found:', {
      workoutId: workout._id.toString(),
      workoutName: workout.name,
      workoutOwner: workout.userId.toString(),
      assignedCustomers: workout.assignedCustomers?.length || 0,
      assignedCoaches: workout.assignedCoaches?.length || 0
    });

    // Verificar permisos
    const userRole = await getCurrentUserRole(session.user.id);
    const isAdmin = userRole === 'admin';
    const isCoach = userRole === 'coach';
    const isOwner = workout.userId.toString() === user._id.toString();

    console.log('[updateWorkoutName] Basic permission check:', {
      userRole,
      isAdmin,
      isCoach,
      isOwner,
      userId: user._id.toString(),
      workoutOwner: workout.userId.toString()
    });

    // Check if user is assigned to this workout
    const isAssignedCustomer = workout.assignedCustomers && 
      Array.isArray(workout.assignedCustomers) && 
      workout.assignedCustomers.some((customerId: Types.ObjectId | string) => {
        const customerIdStr = customerId instanceof Types.ObjectId ? customerId.toString() : customerId;
        const isAssigned = customerIdStr === user._id.toString();
        console.log('[updateWorkoutName] Checking customer assignment:', {
          customerId: customerIdStr,
          userId: user._id.toString(),
          isAssigned
        });
        return isAssigned;
      });

    // Check if user is an assigned coach
    const isAssignedCoach = workout.assignedCoaches && 
      Array.isArray(workout.assignedCoaches) && 
      workout.assignedCoaches.some((coachId: Types.ObjectId | string) => {
        const coachIdStr = coachId instanceof Types.ObjectId ? coachId.toString() : coachId;
        const isAssigned = coachIdStr === user._id.toString();
        console.log('[updateWorkoutName] Checking coach assignment:', {
          coachId: coachIdStr,
          userId: user._id.toString(),
          isAssigned
        });
        return isAssigned;
      });

    console.log('[updateWorkoutName] Permission check summary:', {
      isAdmin,
      isCoach,
      isOwner,
      isAssignedCustomer,
      isAssignedCoach
    });

    if (!isAdmin && !isCoach && !isOwner && !isAssignedCustomer && !isAssignedCoach) {
      console.error('[updateWorkoutName] Permission denied:', {
        userId: user._id.toString(),
        workoutId,
        isAdmin,
        isCoach,
        isOwner,
        isAssignedCustomer,
        isAssignedCoach
      });
      throw new Error('No tienes permiso para modificar esta rutina');
    }

    // Actualizar nombre y descripción
    workout.name = sanitizeHtml(newName);
    workout.description = sanitizeHtml(newDescription);
    
    console.log('[updateWorkoutName] Saving changes:', {
      workoutId,
      newName: workout.name,
      newDescription: workout.description
    });
    
    await workout.save();

    console.log('[updateWorkoutName] Update successful:', {
      workoutId,
      workoutName: workout.name
    });

    // Serializar el objeto antes de devolverlo
    const serializedWorkout = JSON.parse(JSON.stringify(workout.toObject()));
    
    // Asegurarnos de que el ID esté disponible en ambos formatos
    if (serializedWorkout._id) {
      serializedWorkout.id = serializedWorkout._id.toString();
    }

    // Revalidate both the specific workout and the workouts list
    revalidatePath('/workout');
    revalidatePath(`/workout/${workoutId}`);
    revalidatePath('/api/workout');
    
    console.log('[updateWorkoutName] Revalidating paths:', {
      paths: ['/workout', `/workout/${workoutId}`, '/api/workout']
    });

    return serializedWorkout;
  } catch (error) {
    console.error('[updateWorkoutName] Error:', {
      workoutId,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Checks if a user has reached their workout limit
 * Regular users are limited to 3 workouts, admins and coaches have no limit
 */
export async function checkWorkoutLimit(userId: string): Promise<{ 
  canCreate: boolean; 
  currentCount: number;
  maxAllowed: number;
  userRole: string;
}> {

  try {
    await dbConnect();

    // Find the user first to get their MongoDB ID
    let userQuery;
    if (Types.ObjectId.isValid(userId)) {
      userQuery = { _id: new Types.ObjectId(userId) };
    } else if (userId.includes('@')) {
      userQuery = { email: userId };
    } else {
      userQuery = { sub: userId };
    }

    const user = await (User.findOne as any)(userQuery).lean();

    if (!user) {
      console.error('[WorkoutLimit] User not found:', { userId });
      return { canCreate: false, currentCount: 0, maxAllowed: 0, userRole: 'unknown' };
    }

    // Get user role
    const userRole = await getCurrentUserRole(userId);
    const isCoachOrAdmin = userRole === 'admin' || userRole === 'coach';

    // If user is admin or coach, they have no limit
    if (isCoachOrAdmin) {
      console.log('[WorkoutLimit] User is admin/coach, no limit applies:', {
        userId,
        userRole
      });
      return { 
        canCreate: true, 
        currentCount: 0, 
        maxAllowed: Infinity,
        userRole 
      };
    }

    // Count active workouts created by the user
    const workoutCount = await (Workout.countDocuments as any)({
      userId: user._id.toString(),
      createdBy: user._id.toString(),
      status: 'active'
    });

    const maxAllowed = 3;
    const canCreate = workoutCount < maxAllowed;

    return {
      canCreate,
      currentCount: workoutCount,
      maxAllowed,
      userRole
    };
  } catch (error) {
    console.error('[WorkoutLimit] Error checking workout limit:', {
      userId,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error'
    });
    return { canCreate: false, currentCount: 0, maxAllowed: 0, userRole: 'unknown' };
  }
} 