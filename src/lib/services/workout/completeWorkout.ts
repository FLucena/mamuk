import { dbConnect } from '@/lib/db';
import { Workout } from '@/lib/models/workout';
import { Types } from 'mongoose';
import { validateMongoId } from '@/lib/utils/security';
import { transformMongoWorkout } from '@/lib/utils/transformers';
import { canModifyWorkout } from '@/lib/utils/permissions';
import { WORKOUT_STATUS } from '@/lib/constants/roles';

export async function completeWorkout(id: string, userId: string) {
  console.log('Service: Starting completeWorkout for workout:', { id, userId });
  
  if (!id || !userId) {
    console.error('Service: Missing required parameters:', { id, userId });
    throw new Error('Workout ID and User ID are required');
  }
  if (!validateMongoId(id)) {
    console.error('Service: Invalid workout ID:', id);
    throw new Error('Invalid workout ID');
  }

  await dbConnect();
  try {
    // Check if workout exists and user has permission
    const existingWorkout = await Workout.findOne({ _id: new Types.ObjectId(id) });
    if (!existingWorkout) {
      console.error('Service: Workout not found:', { id, userId });
      return null;
    }

    console.log('Service: Found existing workout:', { 
      id, 
      name: existingWorkout.name,
      currentStatus: existingWorkout.status 
    });

    const hasPermission = await canModifyWorkout(userId, existingWorkout);
    if (!hasPermission) {
      console.error('Service: User does not have permission to complete workout:', { id, userId });
      throw new Error('No tienes permiso para marcar esta rutina como completada');
    }

    // Only allow completing from active status
    if (existingWorkout.status !== WORKOUT_STATUS.ACTIVE) {
      console.error('Service: Cannot complete workout with current status:', { 
        id, 
        name: existingWorkout.name,
        currentStatus: existingWorkout.status 
      });
      throw new Error('Solo se pueden marcar como completadas las rutinas activas');
    }

    // Complete the workout
    console.log('Service: Completing workout:', { 
      id, 
      name: existingWorkout.name,
      fromStatus: existingWorkout.status 
    });

    const workout = await Workout.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $set: { status: WORKOUT_STATUS.COMPLETE } },
      { new: true }
    );

    if (!workout) {
      console.error('Service: Failed to complete workout:', { id, userId });
      return null;
    }

    console.log('Service: Workout successfully completed:', { 
      id, 
      name: workout.name,
      newStatus: workout.status 
    });
    return transformMongoWorkout(workout);
  } catch (error) {
    console.error('Service: Error in completeWorkout:', error);
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return null;
    }
    throw error;
  }
} 