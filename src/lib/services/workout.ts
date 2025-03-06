import { dbConnect } from '@/lib/db';
import { Rutina } from '@/lib/models/workout';
import { Rutina as RutinaType, DiaRutina, Block, Exercise } from '@/types/models';
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

interface MongoDiaRutina extends DiaRutina, MongoDoc {
  blocks: MongoBlock[];
}

interface MongoRutina extends MongoDoc {
  userId: string;
  name: string;
  description?: string;
  days: MongoDiaRutina[];
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

function sanitizeDiaRutina(dia: DiaRutina): DiaRutina {
  return {
    ...dia,
    name: sanitizeHtml(dia.name),
    blocks: dia.blocks.map(sanitizeBlock),
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

export function mapWorkoutToResponse(doc: MongoRutina): RutinaType {
  if (!doc) {
    throw new Error('Document is undefined');
  }

  // Crear un array de días con IDs válidos
  const days: DiaRutina[] = (doc.days || []).map(day => {
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
  
  // Crear y devolver el objeto Rutina
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    name: doc.name,
    description: doc.description || '',
    days: days,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export async function getWorkouts(userId: string): Promise<RutinaType[]> {
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
    const workouts = await Rutina.find({ 
      status: { $ne: 'archived' }
    }).sort({ createdAt: -1 }).lean<MongoRutina[]>();
    return workouts.map(mapWorkoutToResponse);
  }

  if (currentUser.role === 'coach') {
    const coach = await Coach.findOne({ userId: currentUser._id });
    if (!coach) throw new Error('Coach no encontrado');

    const customerIds = coach.customers.map((id: Types.ObjectId) => id.toString());
    const workouts = await Rutina.find({
      status: 'active',
      userId: { $in: [currentUser._id.toString(), ...customerIds] }
    }).lean<MongoRutina[]>();
    return workouts.map(mapWorkoutToResponse);
  }

  const workouts = await Rutina.find({ 
    userId: { $in: [currentUser._id.toString(), userId] },
    status: 'active'
  }).lean<MongoRutina[]>();
  return workouts.map(mapWorkoutToResponse);
}

/**
 * Obtiene un workout por su ID con validaciones de seguridad mejoradas
 * 
 * @param id ID del workout a obtener
 * @returns El workout si existe y el usuario tiene acceso, o null si no existe
 * @throws Error si el ID es inválido o el usuario no tiene acceso
 */
export async function getWorkout(id: string) {
  try {
    // Validar que el ID sea proporcionado
    if (!id) {
      console.error('[SECURITY] Intento de acceso a workout sin ID');
      throw new Error('ID de rutina no definido');
    }
    
    // Validar que el ID sea un string
    if (typeof id !== 'string') {
      console.error(`[SECURITY] ID de workout con tipo incorrecto: ${typeof id}`);
      throw new Error('ID de rutina inválido');
    }
    
    // Validar que el ID tenga el formato correcto de MongoDB
    if (!validateMongoId(id)) {
      console.error(`[SECURITY] ID de workout con formato inválido: ${id}`);
      throw new Error('ID de rutina inválido');
    }
    
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error('[SECURITY] Intento de acceso a workout sin sesión de usuario');
      throw new Error('No autorizado');
    }
    
    // Conectar a la base de datos
    await dbConnect();
    
    // Obtener el workout
    const workout = await Rutina.findById(id);
    if (!workout) {
      console.warn(`[SECURITY] Intento de acceso a workout inexistente. ID: ${id}`);
      return null;
    }
    
    // Verificar el rol del usuario
    const userRole = await getCurrentUserRole(session.user.email || '');
    const isAdmin = userRole === 'admin';
    
    // Verificar que el usuario sea el propietario o un administrador
    if (workout.userId.toString() !== session.user.id && !isAdmin) {
      console.error(`[SECURITY] Intento de acceso no autorizado a workout. Usuario: ${session.user.id}, Propietario: ${workout.userId}`);
      throw new Error('No autorizado para acceder a esta rutina');
    }
    
    // Convertir a objeto plano para devolverlo
    const workoutData = workout.toObject();
    
    // Crear un objeto plano con IDs válidos para todos los subdocumentos
    const workoutPlain = {
      _id: workoutData._id.toString(),
      name: workoutData.name,
      description: workoutData.description,
      days: (workoutData.days || []).map((day: any) => {
        // Asegurarse de que cada día tenga un ID
        const dayId = day.id || `day_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          ...day,
          _id: dayId,
          id: dayId,
          blocks: (day.blocks || []).map((block: any) => {
            // Asegurarse de que cada bloque tenga un ID
            const blockId = block.id || `block_${Math.random().toString(36).substr(2, 9)}`;
            
            return {
              ...block,
              _id: blockId,
              id: blockId,
              exercises: (block.exercises || []).map((exercise: any) => {
                // Asegurarse de que cada ejercicio tenga un ID
                const exerciseId = exercise.id || `exercise_${Math.random().toString(36).substr(2, 9)}`;
                
                // Asegurarse de que los tags sean un array
                const tags = Array.isArray(exercise.tags) ? exercise.tags : [];
                
                return {
                  ...exercise,
                  _id: exerciseId,
                  id: exerciseId,
                  tags: tags,
                  // Asegurarse de que los campos numéricos tengan valores por defecto
                  sets: exercise.sets || 0,
                  reps: exercise.reps || 0,
                  weight: exercise.weight || 0
                };
              })
            };
          })
        };
      }),
      userId: workoutData.userId.toString(),
      createdAt: workoutData.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: workoutData.updatedAt?.toISOString() || new Date().toISOString()
    };
    
    return workoutPlain;
  } catch (error) {
    console.error('[ERROR] Error al obtener workout:', error);
    throw error;
  }
}

export async function createWorkout(data: Partial<RutinaType>, userId: string): Promise<RutinaType> {
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

  const doc = await Rutina.create(sanitizedData);
  return mapWorkoutToResponse(doc.toObject());
}

export async function updateWorkout(id: string, data: Partial<RutinaType>, userId: string): Promise<RutinaType | null> {
  if (!id || !userId) throw new Error('Workout ID and User ID are required');
  if (!validateMongoId(id)) throw new Error('Invalid workout ID');

  await dbConnect();
  try {
    const { id: _, ...updateData } = data;
    const sanitizedData = {
      ...updateData,
      name: updateData.name ? sanitizeHtml(updateData.name) : undefined,
      description: updateData.description ? sanitizeHtml(updateData.description) : undefined,
      days: updateData.days?.map(sanitizeDiaRutina),
    };

    const user = await User.findOne({ _id: new Types.ObjectId(userId) });
    if (!user) throw new Error('Usuario no encontrado');

    if (user.role === 'admin') {
      const workout = await Rutina.findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId },
        { $set: sanitizedData },
        { new: true }
      ).lean<MongoRutina>();

      return workout ? mapWorkoutToResponse(workout) : null;
    }

    if (user.role === 'coach') {
      const coach = await Coach.findOne({ userId: new Types.ObjectId(userId) });
      if (!coach) throw new Error('Coach no encontrado');

      const customerIds = coach.customers.map((id: Types.ObjectId) => id.toString());
      if (id === userId || customerIds.includes(id)) {
        const workout = await Rutina.findOneAndUpdate(
          { _id: new Types.ObjectId(id), userId },
          { $set: sanitizedData },
          { new: true }
        ).lean<MongoRutina>();

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

export async function archiveWorkout(id: string, userId: string): Promise<RutinaType | null> {
  if (!id || !userId) throw new Error('Workout ID and User ID are required');
  if (!validateMongoId(id)) throw new Error('Invalid workout ID');

  await dbConnect();
  try {
    const user = await User.findOne({ _id: new Types.ObjectId(userId) });
    if (!user) throw new Error('Usuario no encontrado');

    if (user.role === 'admin') {
      const workout = await Rutina.findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId },
        { $set: { status: 'archived' } },
        { new: true }
      ).lean<MongoRutina>();

      return workout ? mapWorkoutToResponse(workout) : null;
    }

    if (user.role === 'coach') {
      const coach = await Coach.findOne({ userId: new Types.ObjectId(userId) });
      if (!coach) throw new Error('Coach no encontrado');

      const customerIds = coach.customers.map((id: Types.ObjectId) => id.toString());
      const existingWorkout = await Rutina.findOne({ _id: new Types.ObjectId(id) }).lean<MongoRutina>();
      
      if (!existingWorkout) return null;

      if (existingWorkout.userId === userId || customerIds.includes(existingWorkout.userId)) {
        const workout = await Rutina.findOneAndUpdate(
          { _id: new Types.ObjectId(id), userId },
          { $set: { status: 'archived' } },
          { new: true }
        ).lean<MongoRutina>();

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