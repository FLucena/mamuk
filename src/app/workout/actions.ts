'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { archiveWorkout } from '@/lib/services/workout';
import { canCreateWorkouts as canUserCreateWorkouts } from '@/lib/utils/permissions';
import { Workout } from '@/lib/models/workout';

export async function handleArchiveWorkout(id: string) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('Server action: Unauthorized - No user session found');
    throw new Error('No autorizado');
  }

  try {
    await archiveWorkout(id, session.user.id);
  } catch (error) {
    console.error('Server action: Error archiving workout:', error);
    throw error;
  }
}

export async function canCreateWorkouts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return false;
  }
  
  return canUserCreateWorkouts(session.user.id);
}

export async function getUserWorkoutCount() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return 0;
  }
  
  try {
    const count = await Workout.countDocuments({ 
      userId: session.user.id,
      createdBy: session.user.id,
      status: 'active'
    });
    return count;
  } catch (error) {
    console.error('Error getting user workout count:', error);
    return 0;
  }
} 