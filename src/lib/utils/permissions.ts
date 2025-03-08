import { Types } from 'mongoose';
import User from '../models/user';
import Coach from '../models/coach';
import { Workout } from '@/types/workouts';
import { dbConnect } from '../db';

interface UserWithRole {
  _id: Types.ObjectId;
  role: string;
  [key: string]: any;
}

export async function getUserWithRole(userId: string) {
  
  // First try to find user by email
  let user = await User.findOne({ email: userId });
  
  // If not found, try to find by MongoDB ID
  if (!user && Types.ObjectId.isValid(userId)) {
    user = await User.findOne({ _id: new Types.ObjectId(userId) });
  }
  
  // If still not found, try to find by Google ID (sub)
  if (!user) {
    user = await User.findOne({ 'sub': userId });
  }
  
  if (!user) {
    console.error('Permissions: User not found:', userId);
    throw new Error('Usuario no encontrado');
  }

  return user;
}

/**
 * Obtiene el rol actualizado de un usuario desde la base de datos
 * @param email El email del usuario
 * @returns El rol del usuario o null si no se encuentra
 */
export async function getCurrentUserRole(email: string): Promise<string | null> {
  if (!email) {
    console.error('Permissions: No email provided for getCurrentUserRole');
    return null;
  }

  await dbConnect();
  
  try {
    const user = await User.findOne({ email }).select('role').lean() as UserWithRole | null;
    
    if (!user) {
      console.error('Permissions: User not found for email:', email);
      return null;
    }
    
    return user.role;
  } catch (error) {
    console.error('Permissions: Error fetching user role:', error);
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
    if (!coach) {
      throw new Error('Coach no encontrado');
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