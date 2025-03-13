export interface MuscleTag {
  id: string;
  name: string;
  color: string;
}

export const muscleTags: MuscleTag[] = [
  {
    id: 'chest',
    name: 'Pecho',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },
  {
    id: 'back',
    name: 'Espalda',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  {
    id: 'shoulders',
    name: 'Hombros',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  {
    id: 'biceps',
    name: 'Bíceps',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  {
    id: 'triceps',
    name: 'Tríceps',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  {
    id: 'legs',
    name: 'Piernas',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  },
  {
    id: 'abs',
    name: 'Abdominales',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
  },
  {
    id: 'glutes',
    name: 'Glúteos',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  },
  {
    id: 'core',
    name: 'Core',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
  },
  {
    id: 'cardio',
    name: 'Cardio',
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
  }
];

// Predefined exercise to muscle tags mapping
export const exerciseToMuscleTags: Record<string, string[]> = {
  // Chest exercises
  'Press de Banca': ['chest', 'triceps', 'shoulders'],
  'Aperturas con Mancuernas': ['chest', 'shoulders'],
  'Fondos en Paralelas': ['chest', 'triceps', 'shoulders'],
  'Flexiones': ['chest', 'triceps', 'core'],
  
  // Back exercises
  'Dominadas': ['back', 'biceps', 'shoulders'],
  'Remo con Barra': ['back', 'biceps', 'shoulders'],
  'Remo con Mancuerna': ['back', 'biceps'],
  'Jalón al Pecho': ['back', 'biceps'],
  
  // Shoulder exercises
  'Press Militar': ['shoulders', 'triceps'],
  'Elevaciones Laterales': ['shoulders'],
  'Elevaciones Frontales': ['shoulders'],
  'Pájaros': ['shoulders', 'back'],
  
  // Arm exercises
  'Curl de Bíceps': ['biceps'],
  'Curl Martillo': ['biceps', 'forearms'],
  'Extensiones de Tríceps': ['triceps'],
  'Press Francés': ['triceps'],
  
  // Leg exercises
  'Sentadillas': ['legs', 'glutes', 'core'],
  'Prensa de Piernas': ['legs', 'glutes'],
  'Extensiones de Cuádriceps': ['legs'],
  'Curl de Isquiotibiales': ['legs'],
  'Peso Muerto': ['legs', 'back', 'glutes', 'core'],
  'Zancadas': ['legs', 'glutes', 'core'],
  
  // Core exercises
  'Crunches': ['abs', 'core'],
  'Plancha': ['core', 'abs', 'shoulders'],
  'Russian Twist': ['abs', 'core'],
  'Elevaciones de Piernas': ['abs', 'core'],
  
  // Cardio exercises
  'Correr': ['cardio', 'legs'],
  'Saltar la Cuerda': ['cardio', 'legs', 'shoulders'],
  'Burpees': ['cardio', 'fullbody'],
  'Mountain Climbers': ['cardio', 'core', 'shoulders']
};

// Function to get muscle tags for an exercise
export function getMuscleTagsForExercise(exerciseName: string): MuscleTag[] {
  const tagIds = exerciseToMuscleTags[exerciseName] || [];
  return muscleTags.filter(tag => tagIds.includes(tag.id));
}

// Function to get a muscle tag by ID
export function getMuscleTagById(id: string): MuscleTag | undefined {
  return muscleTags.find(tag => tag.id === id);
} 