import { Exercise } from '../store/workoutStore';

// Generate a simple unique ID
export const generateId = (): string => Math.random().toString(36).substring(2, 10);

// Template exercise type
interface ExerciseTemplate {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

// Exercise library item type
export interface ExerciseLibraryItem {
  id: string;
  name: string;
  category?: string;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeight?: number;
  description?: string;
}

// Exercise templates for different block types when no exercise library is available
const defaultExerciseTemplates: Record<string, ExerciseTemplate[]> = {
  'Warm-up': [
    { name: 'Jumping Jacks', sets: 1, reps: 30 },
    { name: 'Arm Circles', sets: 1, reps: 20 },
    { name: 'Leg Swings', sets: 1, reps: 15 },
    { name: 'High Knees', sets: 1, reps: 30 },
    { name: 'Butt Kicks', sets: 1, reps: 30 },
    { name: 'Shoulder Rotations', sets: 1, reps: 20 },
    { name: 'Hip Circles', sets: 1, reps: 10 },
    { name: 'Jumping Rope', sets: 1, reps: 50 },
  ],
  'Main': [
    { name: 'Squats', sets: 4, reps: 10, weight: 70 },
    { name: 'Bench Press', sets: 4, reps: 8, weight: 60 },
    { name: 'Deadlift', sets: 4, reps: 6, weight: 100 },
    { name: 'Pull-ups', sets: 3, reps: 8 },
    { name: 'Overhead Press', sets: 3, reps: 8, weight: 40 },
    { name: 'Barbell Rows', sets: 3, reps: 10, weight: 50 },
    { name: 'Lunges', sets: 3, reps: 12, weight: 20 },
    { name: 'Dips', sets: 3, reps: 10 },
  ],
  'Accessory': [
    { name: 'Bicep Curls', sets: 3, reps: 12, weight: 15 },
    { name: 'Tricep Extensions', sets: 3, reps: 12, weight: 15 },
    { name: 'Lateral Raises', sets: 3, reps: 15, weight: 10 },
    { name: 'Face Pulls', sets: 3, reps: 15, weight: 20 },
    { name: 'Leg Extensions', sets: 3, reps: 15, weight: 40 },
    { name: 'Hamstring Curls', sets: 3, reps: 12, weight: 30 },
    { name: 'Calf Raises', sets: 3, reps: 20, weight: 25 },
    { name: 'Chest Flies', sets: 3, reps: 12, weight: 15 },
  ],
  'Finisher': [
    { name: 'Plank', sets: 3, reps: 1, notes: 'Hold for 30 seconds' },
    { name: 'Mountain Climbers', sets: 3, reps: 30 },
    { name: 'Burpees', sets: 3, reps: 15 },
    { name: 'Flutter Kicks', sets: 3, reps: 20 },
    { name: 'Russian Twists', sets: 3, reps: 20 },
    { name: 'Push-up Finisher', sets: 1, reps: 50, notes: 'As many as possible in one set' },
    { name: 'Jumping Squats', sets: 3, reps: 15 },
    { name: 'Kettlebell Swings', sets: 3, reps: 20, weight: 16 },
  ],
  'Default': [
    { name: 'Push-ups', sets: 3, reps: 12 },
    { name: 'Bodyweight Squats', sets: 3, reps: 15 },
    { name: 'Plank', sets: 3, reps: 1, notes: 'Hold for 30 seconds' },
    { name: 'Mountain Climbers', sets: 3, reps: 20 },
    { name: 'Lunges', sets: 3, reps: 10 },
    { name: 'Sit-ups', sets: 3, reps: 20 },
  ]
};

// Generate random exercises for a block type
export const generateRandomExercisesForBlock = (
  blockType: string, 
  count: number = 3
): Exercise[] => {
  // Get the appropriate exercise templates for the block type
  const templates = defaultExerciseTemplates[blockType] || defaultExerciseTemplates.Default;
  
  // Create a randomized list of exercises
  return Array.from({ length: count }).map(() => {
    // Select a random exercise template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Create a new exercise with a unique ID
    return {
      id: generateId(),
      name: template.name,
      sets: template.sets,
      reps: template.reps,
      weight: template.weight,
      notes: template.notes
    };
  });
};

// Generate random exercises from a provided library based on block type
export const generateRandomExercisesFromLibrary = (
  blockType: string,
  exerciseLibrary: ExerciseLibraryItem[],
  count: number = 3
): Exercise[] => {
  // If no exercises in library, fall back to templates
  if (!exerciseLibrary || exerciseLibrary.length === 0) {
    return generateRandomExercisesForBlock(blockType, count);
  }
  
  // Filter exercises by category based on block type
  let filteredExercises = [...exerciseLibrary];
  
  if (blockType === 'Warm-up') {
    filteredExercises = exerciseLibrary.filter(
      e => e.category === 'flexibility' || e.category === 'cardio'
    );
  } else if (blockType === 'Main') {
    filteredExercises = exerciseLibrary.filter(e => e.category === 'strength');
  } else if (blockType === 'Accessory') {
    filteredExercises = exerciseLibrary.filter(e => e.category === 'strength');
  } else if (blockType === 'Finisher') {
    filteredExercises = exerciseLibrary.filter(
      e => e.category === 'cardio' || e.category === 'balance'
    );
  }
  
  // If no matching exercises, fall back to all exercises
  if (filteredExercises.length === 0) {
    filteredExercises = [...exerciseLibrary];
  }
  
  // Create a randomized list of exercises
  const result: Exercise[] = [];
  
  for (let i = 0; i < count; i++) {
    if (filteredExercises.length === 0) break;
    
    // Select a random exercise from the filtered list
    const randomIndex = Math.floor(Math.random() * filteredExercises.length);
    const template = filteredExercises[randomIndex];
    
    // Create a new exercise with a unique ID
    result.push({
      id: generateId(),
      name: template.name,
      sets: template.defaultSets || 3,
      reps: template.defaultReps || 10,
      weight: template.defaultWeight,
      notes: template.description
    });
    
    // Remove the selected exercise to avoid duplicates
    filteredExercises.splice(randomIndex, 1);
  }
  
  // If we couldn't generate enough exercises, add some from the templates
  if (result.length < count) {
    const additionalExercises = generateRandomExercisesForBlock(
      blockType, 
      count - result.length
    );
    result.push(...additionalExercises);
  }
  
  return result;
};

// Interface for a workout block
export interface WorkoutBlock {
  id: string;
  name: string;
  exercises: Exercise[];
  isExpanded: boolean;
}

// Generate a complete set of blocks for a new day
export const generateDefaultBlocks = (): WorkoutBlock[] => {
  return [
    {
      id: generateId(),
      name: 'Warm-up',
      exercises: generateRandomExercisesForBlock('Warm-up', 3),
      isExpanded: true
    },
    {
      id: generateId(),
      name: 'Main',
      exercises: generateRandomExercisesForBlock('Main', 3),
      isExpanded: true
    },
    {
      id: generateId(),
      name: 'Accessory',
      exercises: generateRandomExercisesForBlock('Accessory', 3),
      isExpanded: true
    },
    {
      id: generateId(),
      name: 'Finisher',
      exercises: generateRandomExercisesForBlock('Finisher', 3),
      isExpanded: true
    }
  ];
}; 