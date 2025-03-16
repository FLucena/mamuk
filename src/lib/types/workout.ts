import { Types } from 'mongoose';
import { WorkoutStatus } from '../constants/roles';
import { BodyZone } from '../constants/bodyZones';

export interface MongoDoc {
  _id: Types.ObjectId;
  __v: number;
  [key: string]: any;
}

export interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
  videoUrl?: string;
  tags?: BodyZone[];
}

export interface MongoExercise extends Exercise, MongoDoc {}

export interface Block {
  id?: string;
  name: string;
  exercises: Exercise[];
}

export interface MongoBlock extends Block, MongoDoc {
  exercises: MongoExercise[];
}

/**
 * Types related to workout data
 */

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
  notes?: string;
  restTime?: number; // in seconds
}

export interface WorkoutSet {
  id: string;
  reps?: number;
  weight?: number;
  time?: number; // in seconds
  distance?: number; // in meters
  isCompleted?: boolean;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  days: WorkoutDay[];
  userId: string;
  coachId?: string;
  isShared?: boolean;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  // For server-side usage (not sent to client)
  _id?: string;
}

// Define MongoDB version of WorkoutDay 
export interface MongoWorkoutDay extends Omit<WorkoutDay, 'id'>, MongoDoc {
  exercises: MongoExercise[];
}

export interface MongoWorkout extends MongoDoc {
  userId: string;
  name: string;
  description?: string;
  days: MongoWorkoutDay[];
  status: WorkoutStatus;
  createdAt: Date;
  updatedAt: Date;
} 