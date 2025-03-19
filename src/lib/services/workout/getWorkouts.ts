import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';
import { Types } from 'mongoose';
import { WORKOUT_STATUS } from '@/lib/constants/roles';

export async function getWorkouts(userId: string) {
  if (!userId) {
    console.error('Service: Missing required parameter: userId');
    throw new Error('User ID is required');
  }

  try {
    await dbConnect();
    
    const workouts = await (Workout.find as any)({
      userId: userId,
      isArchived: { $ne: true },
    }).sort({ createdAt: -1 });
    
    // Transformar los documentos de MongoDB a objetos planos
    const transformedWorkouts = workouts.map(workout => {
      return {
        _id: workout._id.toString(),
        name: workout.name,
        description: workout.description,
        days: workout.days,
        userId: workout.userId,
        createdAt: workout.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: workout.updatedAt?.toISOString() || new Date().toISOString()
      };
    });
    
    return transformedWorkouts;
  } catch (error) {
    console.error('Service: Error in getWorkouts:', error);
    throw error;
  }
}

function transformMongoWorkout(workout: any) {
  return {
    _id: workout._id.toString(),
    name: workout.name,
    description: workout.description,
    days: workout.days,
    userId: workout.userId,
    createdAt: workout.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: workout.updatedAt?.toISOString() || new Date().toISOString()
  };
} 