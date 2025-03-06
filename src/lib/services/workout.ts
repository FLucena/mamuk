import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';
import { Workout as WorkoutType, WorkoutDay, Block, Exercise } from '@/types/models';
import { Types } from 'mongoose';
import { sanitizeHtml, sanitizeVideoUrl, validateMongoId } from '@/lib/utils/security';
import { ObjectId } from 'mongodb';
import User from '../models/user';
import Coach from '../models/coach';
import { exerciseList } from '@/data/exercises';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCurrentUserRole } from '@/lib/utils/permissions';

interface MongoDoc {
  _id: Types.ObjectId;
  __v: number;
  [key: string]: any;
}

interface MongoExercise extends Exercise, MongoDoc {}

interface MongoBlock extends Block, MongoDoc {
  exercises: MongoExercise[];
}

interface MongoWorkoutDay extends WorkoutDay, MongoDoc {
  blocks: MongoBlock[];
}

interface MongoWorkout extends MongoDoc {
  userId: string;
  name: string;
  description?: string;
  days: MongoWorkoutDay[];
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

function sanitizeExercise(exercise: Exercise): Exercise {
  const sanitizedVideoUrl = exercise.videoUrl ? sanitizeVideoUrl(exercise.videoUrl) : undefined;
  return {
    ...exercise,
    name: sanitizeHtml(exercise.name),
    videoUrl: sanitizedVideoUrl || undefined,
    notes: exercise.notes ? sanitizeHtml(exercise.notes) : undefined,
  };
}

function sanitizeBlock(block: Block): Block {
  return {
    ...block,
    name: sanitizeHtml(block.name),
    exercises: block.exercises.map(sanitizeExercise),
  };
}

function sanitizeWorkoutDay(day: WorkoutDay): WorkoutDay {
  return {
    ...day,
    name: sanitizeHtml(day.name),
    blocks: day.blocks?.map(sanitizeBlock) || [],
  };
}

function getRandomExercises(count: number): Exercise[] {
  const shuffled = [...exerciseList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(exercise => ({
    id: randomUUID(),
    name: exercise.name,
    sets: 3,
    reps: 12,
    weight: 0,
    videoUrl: exercise.videoUrl,
    notes: exercise.notes
  }));
}

export function mapWorkoutToResponse(doc: MongoWorkout): WorkoutType {
  if (!doc) {
    throw new Error('Document is undefined');
  }

  // Crear un array de días con IDs válidos
  const days: WorkoutDay[] = (doc.days || []).map(day => {
    // Asegurarse de que cada día tenga un ID
    const dayId = day.id || (day._id ? day._id.toString() : `day_${Math.random().toString(36).substr(2, 9)}`);
    
    // Crear un array de bloques con IDs válidos
    const blocks: Block[] = (day.blocks || []).map(block => {
      // Asegurarse de que cada bloque tenga un ID
      const blockId = block.id || (block._id ? block._id.toString() : `block_${Math.random().toString(36).substr(2, 9)}`);
      
      // Crear un array de ejercicios con IDs válidos
      const exercises: Exercise[] = (block.exercises || []).map(exercise => {
        // Asegurarse de que cada ejercicio tenga un ID
        const exerciseId = exercise.id || (exercise._id ? exercise._id.toString() : `exercise_${Math.random().toString(36).substr(2, 9)}`);
        
        // Asegurarse de que los tags sean un array
        const tags = Array.isArray(exercise.tags) ? exercise.tags : [];
        
        // Crear un ejercicio con valores por defecto para campos obligatorios
        return {
          id: exerciseId,
          name: exercise.name || `Ejercicio ${Math.floor(Math.random() * 100)}`,
          sets: exercise.sets || 0,
          reps: exercise.reps || 0,
          weight: exercise.weight || 0,
          videoUrl: exercise.videoUrl || '',
          notes: exercise.notes || '',
          tags: tags
        };
      });
      
      // Crear un bloque con valores por defecto para campos obligatorios
      return {
        id: blockId,
        name: block.name || `Bloque ${Math.floor(Math.random() * 100)}`,
        exercises: exercises
      };
    });
    
    // Crear un día con valores por defecto para campos obligatorios
    return {
      id: dayId,
      name: day.name || `Día ${Math.floor(Math.random() * 100)}`,
      blocks: blocks
    };
  });
  
  // Crear y devolver el objeto Workout
  return {
    id: doc._id.toString(),
    userId: typeof doc.userId === 'string' ? doc.userId : (doc.userId as any).toString(),
    name: doc.name,
    description: doc.description || '',
    days,
    status: doc.status,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString()
  };
}

export async function getWorkouts(userId: string): Promise<WorkoutType[]> {
  if (!userId) throw new Error('User ID is required');

  await dbConnect();
  
  let currentUser = await User.findOne({ email: userId });
  if (!currentUser && Types.ObjectId.isValid(userId)) {
    currentUser = await User.findOne({ _id: new Types.ObjectId(userId) });
  }
  if (!currentUser) {
    currentUser = await User.findOne({ 'sub': userId });
  }
  if (!currentUser) throw new Error('Usuario no encontrado');

  if (currentUser.role === 'admin') {
    const workouts = await Workout.find({ 
      status: { $ne: 'archived' }
    }).sort({ createdAt: -1 }).lean<MongoWorkout[]>();
    return workouts.map(mapWorkoutToResponse);
  }

  if (currentUser.role === 'coach') {
    const coach = await Coach.findOne({ userId: currentUser._id });
    if (!coach) throw new Error('Coach no encontrado');

    const coachData = coach as any;
    const customerIds = coachData.customers.map((id: Types.ObjectId) => id.toString());
    const workouts = await Workout.find({
      status: 'active',
      userId: { $in: [currentUser._id.toString(), ...customerIds] }
    }).lean<MongoWorkout[]>();
    return workouts.map(mapWorkoutToResponse);
  }

  const workouts = await Workout.find({ 
    userId: { $in: [currentUser._id.toString(), userId] },
    status: 'active'
  }).lean<MongoWorkout[]>();
  return workouts.map(mapWorkoutToResponse);
}

/**
 * Obtiene un workout por su ID.
 * Si se proporciona userId, verifica que el usuario tenga acceso al workout.
 * @param id ID del workout
 * @param userId ID del usuario (opcional)
 * @returns El workout o null si no se encuentra o el usuario no tiene acceso
 * @throws Error si el ID es inválido o el usuario no tiene acceso
 */
export async function getWorkout(id: string, userId?: string) {
  try {
    // Validar que el ID sea proporcionado
    if (!id) {
      console.error('[SECURITY] Intento de acceso a workout sin ID');
      throw new Error('ID de workout no definido');
    }
    
    // Validar que el ID sea un string
    if (typeof id !== 'string') {
      console.error(`[SECURITY] ID de workout con tipo incorrecto: ${typeof id}`);
      throw new Error('ID de workout inválido');
    }
    
    // Validar que el ID tenga el formato correcto de MongoDB
    if (!validateMongoId(id)) {
      console.error(`[SECURITY] ID de workout con formato inválido: ${id}`);
      throw new Error('ID de workout inválido');
    }
    
    // Si se proporciona userId, validar que sea un string y tenga formato correcto
    if (userId !== undefined) {
      if (typeof userId !== 'string') {
        console.error(`[SECURITY] userId con tipo incorrecto: ${typeof userId}`);
        throw new Error('ID de usuario inválido');
      }
      
      if (!validateMongoId(userId)) {
        console.error(`[SECURITY] userId con formato inválido: ${userId}`);
        throw new Error('ID de usuario inválido');
      }
    }
    
    await dbConnect();
    
    // Buscar el workout
    const workout = await Workout.findById(id).lean<MongoWorkout>();
    
    if (!workout) {
      console.error(`[INFO] Workout no encontrado. ID: ${id}`);
      return null;
    }
    
    // Si se proporcionó un userId, verificar que tenga acceso
    if (userId) {
      // Obtener el rol del usuario
      const userRole = await getCurrentUserRole(userId);
      const isAdmin = userRole === 'admin';
      const isCoach = userRole === 'coach';
      
      // Permitir acceso si:
      // 1. El usuario es el propietario
      // 2. El usuario es admin
      // 3. El usuario es coach y es el entrenador del propietario
      if (
        workout.userId.toString() !== userId && 
        !isAdmin &&
        !(isCoach && await isUserCoach(userId, workout.userId.toString()))
      ) {
        console.error(`[SECURITY] Usuario ${userId} intentó acceder a workout ${id} sin permisos`);
        return null;
      }
    }
    
    // Transformar el workout para la respuesta
    const transformedWorkout = {
      ...workout,
      id: workout._id.toString(),
      userId: workout.userId.toString()
    };
    
    return transformedWorkout;
  } catch (error) {
    console.error(`[ERROR] Error al obtener workout ${id}:`, error);
    throw error;
  }
}

/**
 * Verifica si un usuario es coach de otro usuario
 */
async function isUserCoach(coachUserId: string, studentUserId: string): Promise<boolean> {
  try {
    const coach = await Coach.findOne({ userId: coachUserId }).lean();
    if (!coach) return false;

    // Verificar si existe la propiedad customers y es un array
    const coachData = coach as any;
    if (!coachData.customers || !Array.isArray(coachData.customers)) {
      return false;
    }

    // Verificar si el studentUserId está en la lista de clientes del coach
    return coachData.customers.some(
      (customerId: any) => customerId && customerId.toString() === studentUserId
    );
  } catch (error) {
    console.error(`[ERROR] Error al verificar si ${coachUserId} es coach de ${studentUserId}:`, error);
    return false;
  }
}

export async function createWorkout(data: Partial<WorkoutType>, userId: string): Promise<WorkoutType> {
  if (!userId) throw new Error('User ID is required');

  await dbConnect();

  const defaultDays = Array.from({ length: 3 }, (_, dayIndex) => ({
    id: randomUUID(),
    name: `Día ${dayIndex + 1}`,
    blocks: Array.from({ length: 3 }, (_, blockIndex) => ({
      id: randomUUID(),
      name: `Bloque ${blockIndex + 1}`,
      exercises: getRandomExercises(3)
    }))
  }));

  const sanitizedData = {
    ...data,
    userId: Types.ObjectId.isValid(userId) ? userId : new Types.ObjectId(userId).toString(),
    name: data.name ? sanitizeHtml(data.name) : 'Rutina de Volumen',
    description: data.description ? sanitizeHtml(data.description) : 'Ganar masa muscular',
    days: defaultDays,
    status: 'active'
  };

  const doc = await Workout.create(sanitizedData);
  return mapWorkoutToResponse(doc.toObject());
}

export async function updateWorkout(id: string, data: Partial<WorkoutType>, userId: string): Promise<WorkoutType | null> {
  if (!id || !userId) throw new Error('Workout ID and User ID are required');
  if (!validateMongoId(id)) throw new Error('Invalid workout ID');

  await dbConnect();
  try {
    const { id: _, ...updateData } = data;
    const sanitizedData = {
      ...updateData,
      name: updateData.name ? sanitizeHtml(updateData.name) : undefined,
      description: updateData.description ? sanitizeHtml(updateData.description) : undefined,
      days: updateData.days?.map(sanitizeWorkoutDay),
    };

    const user = await User.findOne({ _id: new Types.ObjectId(userId) });
    if (!user) throw new Error('Usuario no encontrado');

    if (user.role === 'admin') {
      const workout = await Workout.findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId },
        { $set: sanitizedData },
        { new: true }
      ).lean<MongoWorkout>();

      return workout ? mapWorkoutToResponse(workout) : null;
    }

    if (user.role === 'coach') {
      const coach = await Coach.findOne({ userId: new Types.ObjectId(userId) });
      if (!coach) throw new Error('Coach no encontrado');

      const coachData = coach as any;
      const customerIds = coachData.customers.map((id: Types.ObjectId) => id.toString());
      if (id === userId || customerIds.includes(id)) {
        const workout = await Workout.findOneAndUpdate(
          { _id: new Types.ObjectId(id), userId },
          { $set: sanitizedData },
          { new: true }
        ).lean<MongoWorkout>();

        return workout ? mapWorkoutToResponse(workout) : null;
      }
    }

    throw new Error('No tienes permiso para actualizar esta rutina');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return null;
    }
    throw error;
  }
}

export async function archiveWorkout(id: string, userId: string): Promise<WorkoutType | null> {
  if (!id || !userId) throw new Error('Workout ID and User ID are required');
  if (!validateMongoId(id)) throw new Error('Invalid workout ID');

  await dbConnect();
  try {
    const user = await User.findOne({ _id: new Types.ObjectId(userId) });
    if (!user) throw new Error('Usuario no encontrado');

    if (user.role === 'admin') {
      const workout = await Workout.findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId },
        { $set: { status: 'archived' } },
        { new: true }
      ).lean<MongoWorkout>();

      return workout ? mapWorkoutToResponse(workout) : null;
    }

    if (user.role === 'coach') {
      const coach = await Coach.findOne({ userId: new Types.ObjectId(userId) });
      if (!coach) throw new Error('Coach no encontrado');

      const coachData = coach as any;
      const customerIds = coachData.customers.map((id: Types.ObjectId) => id.toString());
      const existingWorkout = await Workout.findOne({ _id: new Types.ObjectId(id) }).lean<MongoWorkout>();
      
      if (!existingWorkout) return null;

      if (existingWorkout.userId === userId || customerIds.includes(existingWorkout.userId)) {
        const workout = await Workout.findOneAndUpdate(
          { _id: new Types.ObjectId(id), userId },
          { $set: { status: 'archived' } },
          { new: true }
        ).lean<MongoWorkout>();

        return workout ? mapWorkoutToResponse(workout) : null;
      }
      throw new Error('No tienes permiso para archivar esta rutina');
    }

    throw new Error('No tienes permiso para archivar esta rutina');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return null;
    }
    throw error;
  }
}

/**
 * Obtiene todos los workouts de un usuario específico
 * @param userId ID del usuario del que obtener los workouts
 * @returns Array de workouts del usuario
 */
export async function getWorkoutsByUserId(userId: string): Promise<WorkoutType[]> {
  try {
    console.log(`[WORKOUT] Obteniendo workouts para el usuario: ${userId}`);
    
    // Validar ID de usuario
    if (!userId) {
      console.error('[WORKOUT] ID de usuario no proporcionado');
      throw new Error('ID de usuario no definido');
    }
    
    if (!validateMongoId(userId)) {
      console.error(`[WORKOUT] ID de usuario con formato inválido: ${userId}`);
      throw new Error('ID de usuario inválido');
    }
    
    await dbConnect();
    
    // Buscar workouts del usuario
    const workouts = await Workout.find({ 
      userId,
      status: 'active' // Solo workouts activos
    }).lean<MongoWorkout[]>();
    
    console.log(`[WORKOUT] Encontrados ${workouts.length} workouts para el usuario ${userId}`);
    
    // Transformar los workouts para la respuesta
    return workouts.map(workout => mapWorkoutToResponse(workout));
  } catch (error) {
    console.error(`[ERROR] Error al obtener workouts del usuario ${userId}:`, error);
    // En caso de error, devolver un array vacío
    return [];
  }
} 