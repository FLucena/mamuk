'use server';

// Import the necessary modules
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';
import { Types } from 'mongoose';
import { getCurrentUserRole } from '@/lib/utils/permissions';
import User from '@/lib/models/user';
import { sanitizeHtml, validateMongoId } from '@/lib/utils/security';
import mongoose from 'mongoose';
import { toast } from 'sonner';

// Duplicate workout function
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
    await dbConnect();
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
      
      // Revalidar la caché
      revalidatePath(`/workout/${newWorkout._id}`);
      revalidatePath('/workout');
      
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

// Assign workout to user function
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
    const originalWorkout = await Workout.findById(workoutId);
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
    const newWorkout = new Workout({
      ...workoutData,
      userId: targetUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Guardar la nueva rutina
    await newWorkout.save();
    console.log('[ASSIGN] Rutina duplicada y asignada exitosamente. Nueva rutina ID:', newWorkout._id);

    // Revalidar la caché
    revalidatePath(`/workout/${newWorkout._id}`);
    revalidatePath('/workout');

    // Convertir a objeto serializable
    const serializedWorkout = JSON.parse(JSON.stringify(newWorkout.toObject()));
    serializedWorkout.id = serializedWorkout._id.toString();

    return serializedWorkout;
  } catch (error) {
    console.error('[ASSIGN] Error al asignar rutina:', error);
    throw error;
  }
}

// Update workout name function
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
    const workout = await Workout.findById(workoutId);
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
    revalidatePath(`/workout/${workoutId}`);
    revalidatePath('/workout');

    // Convertir a objeto plano
    const serializedWorkout = JSON.parse(JSON.stringify(workout.toObject()));

    return serializedWorkout;
  } catch (error) {
    console.error('Error al actualizar el nombre de la rutina:', error);
    throw error;
  }
}

// Update workout description function
export async function updateWorkoutDescription(workoutId: string, newDescription: string) {
  try {
    // Validar que el ID de la rutina sea proporcionado
    if (!workoutId) {
      throw new Error('ID de rutina no definido');
    }

    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error('No autorizado');
    }

    // Conectar a la base de datos
    await dbConnect();

    // Buscar la rutina
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      throw new Error('Rutina no encontrada');
    }

    // Verificar que el usuario es propietario o admin
    const userRole = await getCurrentUserRole(session.user.email || '');
    const isAdmin = userRole === 'admin';

    if (workout.userId.toString() !== session.user.id && !isAdmin) {
      throw new Error('No autorizado para modificar esta rutina');
    }

    // Sanitizar la descripción
    const sanitizedDescription = sanitizeHtml(newDescription);

    // Actualizar la descripción
    workout.description = sanitizedDescription;
    workout.updatedAt = new Date();

    // Guardar los cambios
    await workout.save();

    // Revalidar caché
    revalidatePath(`/workout/${workoutId}`);
    revalidatePath('/workout');

    // Convertir a objeto plano
    const serializedWorkout = JSON.parse(JSON.stringify(workout.toObject()));

    return serializedWorkout;
  } catch (error) {
    console.error('Error al actualizar la descripción de la rutina:', error);
    throw error;
  }
} 