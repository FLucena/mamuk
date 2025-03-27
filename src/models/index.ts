// Main export file for all models

import User, { IUser, UserRole } from './User';
import Exercise, { IExercise, ExerciseCategory } from './Exercise';
import Workout, { IWorkout, IWorkoutDay, IWorkoutBlock, IExerciseInstance } from './Workout';
import { 
  WorkoutSession, 
  BodyMeasurement, 
  IWorkoutSession, 
  IBodyMeasurement 
} from './Progress';
import CoachingRelationship, { ICoachingRelationship, CoachingStatus } from './CoachingRelationship';

// Export all models
export {
  // Models
  User,
  Exercise,
  Workout,
  WorkoutSession,
  BodyMeasurement,
  CoachingRelationship,
  
  // Interfaces
  IUser,
  IExercise,
  IWorkout,
  IWorkoutDay,
  IWorkoutBlock,
  IExerciseInstance,
  IWorkoutSession,
  IBodyMeasurement,
  ICoachingRelationship,
  
  // Types and Enums
  UserRole,
  ExerciseCategory,
  CoachingStatus
};

// Export default object with all models
export default {
  User,
  Exercise,
  Workout,
  WorkoutSession,
  BodyMeasurement,
  CoachingRelationship
}; 