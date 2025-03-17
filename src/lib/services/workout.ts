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
  
  console.time('getWorkouts'); // Start the timer once at the beginning
  
  try {
    // Handle different possible userId formats
    let currentUser = null;
    let userQuery;
    
    // Check if it looks like an email
    if (userId.includes('@')) {
      userQuery = { email: userId };
    } 
    // Check if it's a valid ObjectId
    else if (Types.ObjectId.isValid(userId)) {
      userQuery = { _id: new Types.ObjectId(userId) };
    } 
    // Otherwise try by sub (for OAuth users)
    else {
      userQuery = { sub: userId };
    }
    
    // Define a proper type for the user returned from lean()
    interface LeanUserDocument {
      _id: Types.ObjectId;
      roles: string[];
      [key: string]: any;
    }
    
    // Use a more efficient query with projection and proper typing
    currentUser = await User.findOne(userQuery)
      .select('_id roles')
      .lean()
      .exec() as LeanUserDocument | null;
    
    // If user is still not found, return empty array instead of throwing error
    if (!currentUser) {
      console.warn(`User not found with ID: ${userId}`);
      return [];
    }

    // Admin users can see all active workouts
    if (Array.isArray(currentUser.roles) && currentUser.roles.includes('admin')) {
      const workouts = await Workout.find({ 
        status: { $ne: 'archived' }
      })
      .sort({ createdAt: -1 })
      .limit(100) // Add a reasonable limit
      .lean<MongoWorkout[]>();
      
      return workouts.map(mapWorkoutToResponse);
    }

    // Coach users can see their own workouts and their customers' workouts
    if (Array.isArray(currentUser.roles) && currentUser.roles.includes('coach')) {
      const coach = await Coach.findOne({ userId: currentUser._id });
      
      // If coach profile doesn't exist, create it
      if (!coach) {
        try {
          const newCoach = await ensureCoachExists(currentUser._id.toString());
          
          // If we still couldn't create a coach, just return workouts created by this user
          if (!newCoach) {
            const workouts = await Workout.find({
              status: 'active',
              userId: currentUser._id.toString()
            }).lean<MongoWorkout[]>();
            return workouts.map(mapWorkoutToResponse);
          }
        } catch (error) {
          console.error('Error creating coach profile:', error);
          // Return just the user's own workouts if coach creation fails
          const workouts = await Workout.find({
            status: 'active',
            userId: currentUser._id.toString()
          }).lean<MongoWorkout[]>();
          return workouts.map(mapWorkoutToResponse);
        }
      }

      // Get coach's customers
      const coachData = coach as any;
      const customerIds = Array.isArray(coachData.customers) 
        ? coachData.customers.map((id: Types.ObjectId) => id.toString())
        : [];
        
      const workouts = await Workout.find({
        status: 'active',
        userId: { $in: [currentUser._id.toString(), ...customerIds] }
      }).lean<MongoWorkout[]>();
      return workouts.map(mapWorkoutToResponse);
    }

    // Regular users can see their own workouts and workouts assigned to them
    const workouts = await Workout.find({ 
      $or: [
        { userId: currentUser._id.toString() }, // Workouts created by the user
        { assignedCustomers: currentUser._id.toString() } // Workouts assigned to the user as a customer
      ],
      status: 'active'
    }).lean<MongoWorkout[]>();
    return workouts.map(mapWorkoutToResponse);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    // Return empty array instead of throwing error
    return [];
  } finally {
    // Always end the timer exactly once, regardless of the code path
    console.timeEnd('getWorkouts');
  }
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
      
      // Si es admin, permitir acceso inmediatamente
      if (isAdmin) {
        console.log(`[DEBUG] Usuario ${userId} es admin, permitiendo acceso a workout ${id}`);
        const transformedWorkout = {
          ...workout,
          id: workout._id.toString(),
          userId: workout.userId.toString()
        };
        return transformedWorkout;
      }
      
      const isCoach = userRole === 'coach';
      
      console.log(`[DEBUG] Verificando permisos para usuario ${userId}:`, {
        userRole,
        isAdmin,
        isCoach,
        workoutUserId: workout.userId.toString(),
        isOwner: workout.userId.toString() === userId
      });
      
      // Verificar si el usuario está asignado a este workout
      const isAssignedCustomer = workout.assignedCustomers && 
        Array.isArray(workout.assignedCustomers) && 
        workout.assignedCustomers.some(customerId => 
          customerId.toString() === userId
        );
      
      // Verificar si el usuario es un coach asignado a este workout
      const isAssignedCoach = workout.assignedCoaches && 
        Array.isArray(workout.assignedCoaches) && 
        workout.assignedCoaches.some(coachId => 
          coachId.toString() === userId
        );
      
      console.log(`[DEBUG] Asignaciones:`, {
        isAssignedCustomer,
        isAssignedCoach,
        assignedCustomers: workout.assignedCustomers || [],
        assignedCoaches: workout.assignedCoaches || []
      });
      
      // Permitir acceso si:
      // 1. El usuario es el propietario
      // 2. El usuario es coach y es el coach del propietario
      // 3. El usuario es un cliente asignado a este workout
      // 4. El usuario es un coach asignado a este workout
      if (
        workout.userId.toString() !== userId && 
        !(isCoach && await isUserCoach(userId, workout.userId.toString())) &&
        !isAssignedCustomer &&
        !isAssignedCoach
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
    console.log(`[DEBUG] Verificando si ${coachUserId} es coach de ${studentUserId}`);
    
    const coach = await Coach.findOne({ userId: coachUserId }).lean();
    if (!coach) {
      console.log(`[DEBUG] No se encontró el coach con userId: ${coachUserId}`);
      return false;
    }

    // Verificar si existe la propiedad customers y es un array
    const coachData = coach as any;
    if (!coachData.customers || !Array.isArray(coachData.customers)) {
      console.log(`[DEBUG] El coach no tiene clientes o no es un array`);
      return false;
    }

    console.log(`[DEBUG] Clientes del coach:`, coachData.customers.map((c: any) => c.toString()));
    
    // Verificar si el studentUserId está en la lista de clientes del coach
    const isCoach = coachData.customers.some(
      (customerId: any) => customerId && customerId.toString() === studentUserId
    );
    
    console.log(`[DEBUG] ¿Es coach del estudiante?:`, isCoach);
    
    return isCoach;
  } catch (error) {
    console.error(`[ERROR] Error al verificar si ${coachUserId} es coach de ${studentUserId}:`, error);
    return false;
  }
}

export async function createWorkout(data: Partial<WorkoutType>, userId: string, creatorId?: string): Promise<WorkoutType> {
  if (!userId) throw new Error('User ID is required');

  await dbConnect();

  // Get the user to determine their role
  const user = await User.findById(userId).select('roles');
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Si se proporciona un creatorId, verificar que sea un coach o admin
  let isCreatedByCoach = false;
  if (creatorId && creatorId !== userId) {
    const creator = await User.findById(creatorId).select('roles');
    if (!creator) {
      throw new Error('Creador no encontrado');
    }
    
    isCreatedByCoach = creator.roles.includes('coach') || creator.roles.includes('admin');
    
    if (!isCreatedByCoach) {
      throw new Error('Solo coaches y admins pueden crear rutinas para otros usuarios');
    }
  }

  // Determine if the creator is a coach or admin
  const isCoachOrAdmin = user.roles && Array.isArray(user.roles) 
    ? (user.roles.includes('coach') || user.roles.includes('admin'))
    : (user.roles.includes('coach') || user.roles.includes('admin'));

  // For customers, check if they've reached their limit of 3 workouts
  if (!isCoachOrAdmin && !isCreatedByCoach) {
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
    createdBy: creatorId || userId, // Set the createdBy field to track who created the workout
    name: data.name ? sanitizeHtml(data.name) : 'Rutina de Volumen',
    description: data.description ? sanitizeHtml(data.description) : 'Ganar masa muscular',
    days: defaultDays,
    status: 'active',
    isCoachCreated: isCoachOrAdmin || isCreatedByCoach, // Track if the workout was created by a coach or admin
    assignedCustomers: [userId] // Asignar automáticamente al usuario para el que se creó
  };

  const doc = await Workout.create(sanitizedData);
  
  // Si fue creado por un coach, actualizar también el usuario
  if (creatorId && creatorId !== userId) {
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { assignedWorkouts: doc._id } }
    );
  }
  
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
    
    // Buscar workouts del usuario y workouts asignados al usuario
    const workouts = await Workout.find({ 
      $or: [
        { userId }, // Workouts creados por el usuario
        { assignedCustomers: userId } // Workouts asignados al usuario como cliente
      ],
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

export async function getWorkoutById(id: string, userId?: string): Promise<WorkoutType> {
  validateIds(id);
  
  await dbConnect();
  const workout = await Workout.findById(id);
  if (!workout) throw new Error('Workout not found');
  
  // Si se proporcionó un userId, verificar que tenga acceso
  if (userId) {
    // Obtener el rol del usuario
    const userRole = await getCurrentUserRole(userId);
    const isAdmin = userRole === 'admin';
    
    // Si es admin, permitir acceso inmediatamente
    if (isAdmin) {
      console.log(`[DEBUG] Usuario ${userId} es admin, permitiendo acceso a workout ${id}`);
      return mapWorkoutToResponse(workout);
    }
    
    const isCoach = userRole === 'coach';
    
    // Verificar si el usuario está asignado a este workout
    const isAssignedCustomer = workout.assignedCustomers && 
      Array.isArray(workout.assignedCustomers) && 
      workout.assignedCustomers.some((customerId: any) => 
        customerId.toString() === userId
      );
    
    // Verificar si el usuario es un coach asignado a este workout
    const isAssignedCoach = workout.assignedCoaches && 
      Array.isArray(workout.assignedCoaches) && 
      workout.assignedCoaches.some((coachId: any) => 
        coachId.toString() === userId
      );
    
    // Permitir acceso si:
    // 1. El usuario es el propietario
    // 2. El usuario es coach y es el coach del propietario
    // 3. El usuario es un cliente asignado a este workout
    // 4. El usuario es un coach asignado a este workout
    if (
      workout.userId.toString() !== userId && 
      !(isCoach && await isUserCoach(userId, workout.userId.toString())) &&
      !isAssignedCustomer &&
      !isAssignedCoach
    ) {
      throw new Error('No tienes permiso para acceder a esta rutina');
    }
  }
  
  return mapWorkoutToResponse(workout);
} 