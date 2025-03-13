export type WorkoutStatus = 'active' | 'archived' | 'completed';

export interface WorkoutDay {
  id: string;
  name: string;
  blocks: WorkoutBlock[];
}

export interface WorkoutBlock {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  videoUrl?: string;
  notes?: string;
  tags?: string[];
}

export interface WorkoutAssignment {
  id: string;
  workoutId: string;
  userId: string;
  coachId: string; // Added for coach assignment
  assignedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'completed' | 'in_progress';
  assignedCoaches: string[];  // Array of coach IDs
  assignedCustomers: string[]; // Array of customer IDs
}

export interface AssignWorkoutFormData {
  workoutId: string;
  coachIds: string[];  // Changed from single coachId
  customerIds: string[]; // Changed from single userId
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'coach' | 'user';
  image?: string;
}

export interface Coach extends User {
  role: 'admin' | 'coach';
  specialties?: string[];
  experience?: number;
}

export interface Workout {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  days: WorkoutDay[];
  status: WorkoutStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedCoaches: string[];
  assignedCustomers: string[];
} 