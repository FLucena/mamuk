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

export interface WorkoutDay {
  id?: string;
  name: string;
  blocks: Block[];
}

export interface MongoWorkoutDay extends WorkoutDay, MongoDoc {
  blocks: MongoBlock[];
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