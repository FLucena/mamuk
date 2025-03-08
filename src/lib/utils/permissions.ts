import { Types } from 'mongoose';
import User from '../models/user';
import Coach from '../models/coach';
import { Workout } from '@/types/workouts';
import { dbConnect } from '../db';
import { ensureCoachExists } from '../services/coach';

interface UserWithRole {
  _id: Types.ObjectId;
  role: string;
  [key: string]: any;
}

export async function getUserWithRole(userId: string): Promise<UserWithRole> {
  await dbConnect();
  
  let user: any = null;
  
  // Try to find by ID first
  if (Types.ObjectId.isValid(userId)) {
    user = await User.findById(userId).select('_id role').lean();
  }
  
  // If not found, try by email
  if (!user) {
    user = await User.findOne({ email: userId }).select('_id role').lean();
  }
  
  // If still not found, try by sub (for OAuth)
  if (!user) {
    user = await User.findOne({ sub: userId }).select('_id role').lean();
  }
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  return user as UserWithRole;
}

/**
 * Obtiene el rol actualizado de un usuario desde la base de datos
 * @param email El email del usuario
 * @returns El rol del usuario o null si no se encuentra
 */
export async function getCurrentUserRole(email: string): Promise<string | null> {
  if (!email) {
    return null;
  }
  
  try {
    await dbConnect();
    const user = await User.findOne({ email }).select('role');
    return user?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function canAccessWorkout(userId: string, workout: Workout) {
  const user = await getUserWithRole(userId);

  // Admin can access any workout
  if (user.role === 'admin') {
    return true;
  }

  // Coach can access their own workouts and their clients' workouts
  if (user.role === 'coach') {
    const coach = await Coach.findOne({ userId: user._id });
    
    // If coach profile doesn't exist, try to create it
    if (!coach) {
      try {
        const newCoach = await ensureCoachExists(user._id.toString());
        
        // If we successfully created a coach, check access with the new coach
        if (newCoach) {
          const customerIds = newCoach.customers.map((customer: any) => 
            typeof customer === 'string' ? customer : customer._id.toString()
          );
          return workout.userId === userId || customerIds.includes(workout.userId);
        }
        
        // If we couldn't create a coach, only allow access to own workouts
        return workout.userId === userId;
      } catch (error) {
        // If there was an error creating the coach, only allow access to own workouts
        return workout.userId === userId;
      }
    }

    const customerIds = coach.customers.map((id: Types.ObjectId) => id.toString());
    return workout.userId === userId || customerIds.includes(workout.userId);
  }

  // Customer can only access their own workouts
  return workout.userId === userId;
}

export async function canModifyWorkout(userId: string, workout: Workout) {
  const user = await getUserWithRole(userId);
  
  // Admins can always modify
  if (user.role === 'admin') return true;
  
  // Coaches can modify if they're in the assigned coaches
  if (user.role === 'coach') {
    return workout.assignedCoaches.includes(user._id.toString());
  }
  
  return false;
}

export async function canCreateWorkouts(userId: string) {
  const user = await getUserWithRole(userId);
  return user.role === 'admin' || user.role === 'coach';
} 