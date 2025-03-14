import { Types } from 'mongoose';
import User from '../models/user';
import Coach from '../models/coach';
import { Workout as WorkoutModel } from '../models/workout';
import { dbConnect } from '../db';
import { ensureCoachExists } from '../services/coach';

// Update the Workout type to include the new fields
interface Workout {
  id?: string;
  userId: string;
  createdBy?: string;
  name: string;
  description?: string;
  days: any[];
  status?: 'active' | 'archived' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
  assignedCoaches: string[];
  assignedCustomers: string[];
  isCoachCreated?: boolean;
}

interface UserWithRole {
  _id: Types.ObjectId;
  roles: string[];
  [key: string]: any;
}

export async function getUserWithRole(userId: string): Promise<UserWithRole> {
  await dbConnect();
  
  let user: any = null;
  
  // Try to find by ID first
  if (Types.ObjectId.isValid(userId)) {
    user = await User.findById(userId).select('_id roles').lean();
  }
  
  // If not found, try by email
  if (!user) {
    user = await User.findOne({ email: userId }).select('_id roles').lean();
  }
  
  // If still not found, try by sub (for OAuth)
  if (!user) {
    user = await User.findOne({ sub: userId }).select('_id roles').lean();
  }
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  return user as UserWithRole;
}

/**
 * Checks if a user has a specific role
 * @param user User object with roles
 * @param role Role to check
 * @returns true if user has the role, false otherwise
 */
export function hasRole(user: UserWithRole, role: string): boolean {
  if (!user) return false;
  
  return user.roles && Array.isArray(user.roles) && user.roles.includes(role);
}

/**
 * Checks if a user has any of the specified roles
 * @param user User object with roles
 * @param roles Array of roles to check
 * @returns true if user has any of the roles, false otherwise
 */
export function hasAnyRole(user: UserWithRole, roles: string[]): boolean {
  if (!user) return false;
  
  return user.roles && Array.isArray(user.roles) && user.roles.some(role => roles.includes(role));
}

/**
 * Obtiene el rol principal de un usuario desde la base de datos
 * @param userId El ID o email del usuario
 * @returns El rol principal del usuario o null si no se encuentra
 */
export async function getCurrentUserRole(userId: string): Promise<string | null> {
  if (!userId) {
    return null;
  }
  
  try {
    await dbConnect();
    
    let user = null;
    
    // Intentar buscar por ID primero
    if (Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('roles');
    }
    
    // Si no se encuentra, intentar buscar por email
    if (!user) {
      user = await User.findOne({ email: userId }).select('roles');
    }
    
    // Si aún no se encuentra, intentar buscar por sub (para OAuth)
    if (!user) {
      user = await User.findOne({ sub: userId }).select('roles');
    }
    
    if (!user) return null;
    
    // If roles array exists, return the highest priority role
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      return getHighestPriorityRole(user.roles);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

// Helper function to determine the highest priority role
function getHighestPriorityRole(roles: string[]): string {
  const priorityOrder: Record<string, number> = {
    'admin': 1,
    'coach': 2,
    'customer': 3
  };
  
  // Sort roles by priority and return the highest priority (lowest number)
  return [...roles].sort((a, b) => 
    (priorityOrder[a] || 999) - (priorityOrder[b] || 999)
  )[0];
}

/**
 * Obtiene los roles actualizados de un usuario desde la base de datos
 * @param userId El ID o email del usuario
 * @returns Array con los roles del usuario o array vacío si no se encuentra
 */
export async function getCurrentUserRoles(userId: string): Promise<string[]> {
  if (!userId) {
    return [];
  }
  
  try {
    await dbConnect();
    
    let user = null;
    
    // Intentar buscar por ID primero
    if (Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('roles');
    }
    
    // Si no se encuentra, intentar buscar por email
    if (!user) {
      user = await User.findOne({ email: userId }).select('roles');
    }
    
    // Si aún no se encuentra, intentar buscar por sub (para OAuth)
    if (!user) {
      user = await User.findOne({ sub: userId }).select('roles');
    }
    
    if (!user) return [];
    
    // If roles array exists, return it
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

/**
 * Gets all roles for a user
 * @param userId The user's ID or email
 * @returns Array of roles or empty array if not found
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  if (!userId) {
    return [];
  }
  
  try {
    await dbConnect();
    
    let user = null;
    
    // Intentar buscar por ID primero
    if (Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('roles');
    }
    
    // Si no se encuentra, intentar buscar por email
    if (!user) {
      user = await User.findOne({ email: userId }).select('roles');
    }
    
    // Si aún no se encuentra, intentar buscar por sub (para OAuth)
    if (!user) {
      user = await User.findOne({ sub: userId }).select('roles');
    }
    
    if (!user) return [];
    
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles;
    }
    return [];
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

export async function canAccessWorkout(userId: string, workout: Workout) {
  const user = await getUserWithRole(userId);

  // Admin can access any workout
  if (hasRole(user, 'admin')) {
    return true;
  }

  // Coach can access their own workouts and their clients' workouts
  if (hasRole(user, 'coach')) {
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
  if (hasRole(user, 'admin')) return true;
  
  // Coaches can modify if they're in the assigned coaches
  if (hasRole(user, 'coach')) {
    return workout.assignedCoaches.includes(user._id.toString());
  }
  
  // Customers can only modify their own workouts if they created them
  if (hasRole(user, 'customer') && workout.userId === userId) {
    // Check if the workout was created by a coach
    if (workout.createdBy && workout.createdBy !== userId) {
      return false;
    }
    return true;
  }
  
  return false;
}

export async function canCreateWorkouts(userId: string) {
  const user = await getUserWithRole(userId);
  
  // Admins and coaches can always create workouts
  if (hasRole(user, 'admin') || hasRole(user, 'coach')) {
    return true;
  }
  
  // Customers can create up to 3 workouts
  if (hasRole(user, 'customer')) {
    await dbConnect();
    const workoutCount = await WorkoutModel.countDocuments({ 
      userId: user._id.toString(),
      createdBy: user._id.toString(),
      status: 'active'
    });
    return workoutCount < 3;
  }
  
  return false;
} 