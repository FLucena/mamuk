export interface WorkoutAssignment {
  id: string;
  workoutId: string;
  userId: string;
  coachId: string; // Added for coach assignment
  assignedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'completed' | 'in_progress';
}

export interface AssignWorkoutFormData {
  workoutId: string;
  userId: string;
  coachId: string; // Added for coach assignment
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