import { sanitizeHtml, sanitizeVideoUrl } from './security';
import { Exercise, Block, WorkoutDay, Workout, MongoExercise, MongoBlock, MongoWorkoutDay, MongoWorkout } from '../types/workout';

export function transformExercise(exercise: Exercise): Exercise {
  const sanitizedVideoUrl = exercise.videoUrl ? sanitizeVideoUrl(exercise.videoUrl) : undefined;
  return {
    ...exercise,
    name: sanitizeHtml(exercise.name),
    videoUrl: sanitizedVideoUrl || undefined,
    notes: exercise.notes ? sanitizeHtml(exercise.notes) : undefined,
  };
}

export function transformBlock(block: Block): Block {
  return {
    ...block,
    name: sanitizeHtml(block.name),
    exercises: block.exercises.map(transformExercise),
  };
}

export function transformWorkoutDay(dia: WorkoutDay): WorkoutDay {
  return {
    ...dia,
    name: sanitizeHtml(dia.name),
    exercises: dia.exercises.map(exercise => ({
      ...exercise,
      name: sanitizeHtml(exercise.name),
      notes: exercise.notes ? sanitizeHtml(exercise.notes) : undefined
    })),
  };
}

export function transformMongoExercise(exercise: MongoExercise): Exercise {
  return {
    id: exercise._id?.toString() || exercise.id || '',
    name: exercise.name || '',
    sets: exercise.sets || 0,
    reps: exercise.reps || 0,
    weight: exercise.weight || 0,
    videoUrl: exercise.videoUrl,
    notes: exercise.notes,
  };
}

export function transformMongoBlock(block: MongoBlock): Block {
  return {
    id: block._id?.toString() || block.id || '',
    name: block.name || '',
    exercises: Array.isArray(block.exercises) ? block.exercises.map(transformMongoExercise) : [],
  };
}

export function transformMongoWorkoutDay(dia: MongoWorkoutDay): WorkoutDay {
  return {
    id: dia._id?.toString() || dia.id || '',
    name: dia.name || '',
    exercises: Array.isArray(dia.exercises) ? dia.exercises.map(ex => ({
      id: ex._id?.toString() || ex.id || '',
      name: ex.name || '',
      sets: [],
      notes: ex.notes
    })) : [],
    notes: dia.notes
  };
}

export function transformMongoWorkout(doc: MongoWorkout): Workout {
  return {
    id: doc._id?.toString() || '',
    _id: doc._id?.toString() || '',
    userId: doc.userId?.toString() || '',
    name: doc.name || '',
    description: doc.description,
    days: Array.isArray(doc.days) ? doc.days.map(transformMongoWorkoutDay) : [],
    isArchived: doc.status === 'archived',
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString()
  };
} 