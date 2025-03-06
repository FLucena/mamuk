import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';
import { Types } from 'mongoose';
import { transformMongoWorkout } from '@/lib/utils/transformers';
import { WORKOUT_STATUS, ROLES } from '@/lib/constants/roles';
import User from '@/lib/models/user';

export async function getArchivedWorkouts(userId: string) {
  console.log('Service: Starting getArchivedWorkouts for user:', userId);
  
  if (!userId) {
    console.error('Service: Missing required parameter: userId');
    throw new Error('User ID is required');
  }

  await dbConnect();
  try {
    // Check if user is admin
    const user = await User.findOne({ _id: new Types.ObjectId(userId) });
    if (!user) {
      console.error('Service: User not found:', userId);
      throw new Error('Usuario no encontrado');
    }

    if (user.role !== ROLES.ADMIN) {
      console.error('Service: User is not admin:', { userId, role: user.role });
      throw new Error('No tienes permiso para ver las rutinas archivadas');
    }

    // Get all archived workouts
    const workouts = await Workout.find({
      status: WORKOUT_STATUS.ARCHIVED
    }).sort({ updatedAt: -1 });

    console.log('Service: Found archived workouts:', { 
      count: workouts.length,
      userId 
    });

    return workouts.map(workout => transformMongoWorkout(workout));
  } catch (error) {
    console.error('Service: Error in getArchivedWorkouts:', error);
    throw error;
  }
} 