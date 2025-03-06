'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { archiveWorkout } from '@/lib/services/workout';

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
  return session?.user?.role === 'admin' || session?.user?.role === 'coach';
} 