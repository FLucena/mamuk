import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';
import { Workout as WorkoutType, WorkoutDay, Block, Exercise } from '@/types/models';
import { Types } from 'mongoose';
import { sanitizeHtml, sanitizeVideoUrl, validateMongoId, validateIds } from '@/lib/utils/security';
import { ObjectId } from 'mongodb';
import User from '../models/user';
import Coach from '../models/coach';
import { exerciseList } from '@/data/exercises';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCurrentUserRole } from '@/lib/utils/permissions';
import { ensureCoachExists } from './coach';

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
  createdBy: string;
  name: string;
  description?: string;
  days: MongoWorkoutDay[];
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  assignedCoaches?: string[];
  assignedCustomers?: string[];
  isCoachCreated?: boolean;
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
  await dbConnect();
  
  let currentUser = await User.findOne({ email: userId });
  if (!currentUser && Types.ObjectId.isValid(userId)) {
    currentUser = await User.findOne({ _id: new Types.ObjectId(userId) });
  }
  if (!currentUser) {
    currentUser = await User.findOne({ 'sub': userId });
  }
  if (!currentUser) throw new Error('Usuario no encontrado');

  if (currentUser.roles.includes('admin')) {
    const workouts = await Workout.find({ 
      status: { $ne: 'archived' }
    }).sort({ createdAt: -1 }).lean<MongoWorkout[]>();
    return workouts.map(mapWorkoutToResponse);
  }

  if (currentUser.roles.includes('coach')) {
    const coach = await Coach.findOne({ userId: currentUser._id });
    
    // If coach profile doesn't exist, create it
    if (!coach) {
      const newCoach = await ensureCoachExists(currentUser._id.toString());
      
      // If we still couldn't create a coach, just return workouts created by this user
      if (!newCoach) {
        const workouts = await Workout.find({
          status: 'active',
          userId: currentUser._id.toString()
        }).lean<MongoWorkout[]>();
        return workouts.map(mapWorkoutToResponse);
      }
      
      // Use the newly created coach
      const workouts = await Workout.find({
        status: 'active',
        userId: currentUser._id.toString()
      }).lean<MongoWorkout[]>();
      return workouts.map(mapWorkoutToResponse);
    }

    const coachData = coach as any;
    const customerIds = coachData.customers.map((id: Types.ObjectId) => id.toString());
    const workouts = await Workout.find({
      status: 'active',
      userId: { $in: [currentUser._id.toString(), ...customerIds] }
    }).lean<MongoWorkout[]>();
    return workouts.map(mapWorkoutToResponse);
  }

  const workouts = await Workout.find({ 
    userId: currentUser._id.toString(),
    status: 'active'
  }).lean<MongoWorkout[]>();
  return workouts.map(mapWorkoutToResponse);
}

export async function getWorkout(id: string, userId?: string) {
  try {
    validateIds(id);
    
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
      // 3. El usuario es coach y es el coach del propietario
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

  // Get the user to determine their role
  const user = await User.findById(userId).select('roles');
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Determine if the creator is a coach or admin
  const isCoachOrAdmin = user.roles && Array.isArray(user.roles) 
    ? (user.roles.includes('coach') || user.roles.includes('admin'))
    : (user.roles.includes('coach') || user.roles.includes('admin'));

  // For customers, check if they've reached their limit of 3 workouts
  if (!isCoachOrAdmin) {
    const workoutCount = await Workout.countDocuments({
      userId,
      createdBy: userId,
      status: 'active'
    });

    if (workoutCount >= 3) {
      throw new Error('Has alcanzado el límite de 3 rutinas personales');
    }
  }

  const defaultDays = Array.from({ length: 3 }, (_, dayIndex) => ({
    id: randomUUID(),
    name: `Día ${dayIndex + 1}`,
    blocks: Array.from({ length: 4 }, (_, blockIndex) => ({
      id: randomUUID(),
      name: `Bloque ${blockIndex + 1}`,
      exercises: getRandomExercises(3)
    }))
  }));

  const sanitizedData = {
    ...data,
    userId: Types.ObjectId.isValid(userId) ? userId : new Types.ObjectId(userId).toString(),
    createdBy: userId, // Set the createdBy field to track who created the workout
    name: data.name ? sanitizeHtml(data.name) : 'Rutina de Volumen',
    description: data.description ? sanitizeHtml(data.description) : 'Ganar masa muscular',
    days: defaultDays,
    status: 'active',
    isCoachCreated: isCoachOrAdmin // Track if the workout was created by a coach or admin
  };

  const doc = await Workout.create(sanitizedData);
  return mapWorkoutToResponse(doc.toObject());
}

export async function updateWorkout(id: string, data: Partial<WorkoutType>, userId: string): Promise<WorkoutType | null> {
  await dbConnect();
  
  // Validate workout ID
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('ID de rutina inválido');
  }
  
  // Get the workout
  const workout = await Workout.findById(id);
  if (!workout) {
    throw new Error('Rutina no encontrada');
  }
  
  // Check permissions
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  // Admin can update any workout
  if (user.roles.includes('admin')) {
    // Update the workout
    Object.assign(workout, data);
    await workout.save();
    return mapWorkoutToResponse(workout);
  }
  
  // Coach can update workouts they created or for their clients
  if (user.roles.includes('coach')) {
    const coach = await Coach.findOne({ userId: user._id });
    
    // If coach profile doesn't exist, they can only update their own workouts
    if (!coach) {
      if (workout.userId !== userId) {
        throw new Error('No tienes permiso para actualizar esta rutina');
      }
      
      // Update the workout
      Object.assign(workout, data);
      await workout.save();
      return mapWorkoutToResponse(workout);
    }
    
    // Check if the workout belongs to the coach or one of their clients
    const customerIds = coach.customers.map((id: Types.ObjectId) => id.toString());
    if (workout.userId !== userId && !customerIds.includes(workout.userId)) {
      throw new Error('No tienes permiso para actualizar esta rutina');
    }
    
    // Update the workout
    Object.assign(workout, data);
    await workout.save();
    return mapWorkoutToResponse(workout);
  }
  
  // Regular users can only update their own workouts
  if (workout.userId !== userId) {
    throw new Error('No tienes permiso para actualizar esta rutina');
  }
  
  // Update the workout
  Object.assign(workout, data);
  await workout.save();
  return mapWorkoutToResponse(workout);
}

export async function archiveWorkout(id: string, userId: string): Promise<WorkoutType | null> {
  await dbConnect();
  
  // Validate workout ID
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('ID de rutina inválido');
  }
  
  // Get the workout
  const workout = await Workout.findById(id);
  if (!workout) {
    throw new Error('Rutina no encontrada');
  }
  
  // Check permissions
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  // Admin can archive any workout
  if (user.roles.includes('admin')) {
    workout.status = 'archived';
    await workout.save();
    return mapWorkoutToResponse(workout);
  }
  
  // Coach can archive workouts they created or for their clients
  if (user.roles.includes('coach')) {
    const coach = await Coach.findOne({ userId: user._id });
    
    // If coach profile doesn't exist, they can only archive their own workouts
    if (!coach) {
      if (workout.userId !== userId) {
        throw new Error('No tienes permiso para archivar esta rutina');
      }
      
      workout.status = 'archived';
      await workout.save();
      return mapWorkoutToResponse(workout);
    }
    
    // Check if the workout belongs to the coach or one of their clients
    const customerIds = coach.customers.map((id: Types.ObjectId) => id.toString());
    if (workout.userId !== userId && !customerIds.includes(workout.userId)) {
      throw new Error('No tienes permiso para archivar esta rutina');
    }
    
    workout.status = 'archived';
    await workout.save();
    return mapWorkoutToResponse(workout);
  }
  
  // Regular users can only archive their own workouts
  if (workout.userId !== userId) {
    throw new Error('No tienes permiso para archivar esta rutina');
  }
  
  workout.status = 'archived';
  await workout.save();
  return mapWorkoutToResponse(workout);
}

export async function getWorkoutsByUserId(userId: string): Promise<WorkoutType[]> {
  try {
    
    validateMongoId(userId);
    
    await dbConnect();
    
    // Buscar workouts del usuario
    const workouts = await Workout.find({ 
      userId,
      status: 'active' // Solo workouts activos
    }).lean<MongoWorkout[]>();
    
    // Transformar los workouts para la respuesta
    return workouts.map(workout => mapWorkoutToResponse(workout));
  } catch (error) {
    console.error(`[ERROR] Error al obtener workouts del usuario ${userId}:`, error);
    // En caso de error, devolver un array vacío
    return [];
  }
}

export async function getWorkoutById(id: string): Promise<WorkoutType> {
  validateIds(id);
  
  await dbConnect();
  const workout = await Workout.findById(id);
  if (!workout) throw new Error('Workout not found');
  return mapWorkoutToResponse(workout);
} 