import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExerciseTemplate {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'other';
  muscleGroups: string[];
  defaultSets?: number;
  defaultReps?: number;
  defaultWeight?: number;
  description?: string;
  instructions?: string;
  isCustom: boolean; // Whether this is a user-created exercise or a system one
  imageUrl?: string;
  videoUrl?: string;
}

interface ExerciseLibraryState {
  exercises: ExerciseTemplate[];
  fetchExercises: () => void;
  addExercise: (exercise: Omit<ExerciseTemplate, 'id'>) => string;
  updateExercise: (id: string, exercise: Partial<Omit<ExerciseTemplate, 'id'>>) => void;
  deleteExercise: (id: string) => void;
  getExerciseById: (id: string) => ExerciseTemplate | undefined;
  getExercisesByCategory: (category: ExerciseTemplate['category']) => ExerciseTemplate[];
  getExercisesByMuscleGroup: (muscleGroup: string) => ExerciseTemplate[];
}

// Default exercise library
const defaultExercises: ExerciseTemplate[] = [
  // Strength - Upper Body
  {
    id: 'ex-1',
    name: 'Push-up',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    defaultSets: 3,
    defaultReps: 10,
    description: 'A classic bodyweight exercise for upper body strength',
    instructions: 'Start in a plank position with hands slightly wider than shoulder-width apart. Lower your body until your chest nearly touches the floor, then push back up.',
    isCustom: false,
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4'
  },
  {
    id: 'ex-2',
    name: 'Bench Press',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 60,
    description: 'A compound exercise for upper body strength',
    instructions: 'Lie on a bench with feet on the ground. Grip the bar with hands slightly wider than shoulder-width apart. Lower the bar to your chest, then press it back up.',
    isCustom: false,
    imageUrl: 'https://images.unsplash.com/photo-1534368786749-b69d9b24b880?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg'
  },
  {
    id: 'ex-3',
    name: 'Pull-up',
    category: 'strength',
    muscleGroups: ['back', 'biceps', 'shoulders'],
    defaultSets: 3,
    defaultReps: 8,
    description: 'A bodyweight exercise for back and arm strength',
    instructions: 'Hang from a bar with palms facing away from you. Pull your body up until your chin is over the bar, then lower back down with control.',
    isCustom: false,
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1476&q=80',
    videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g'
  },
  {
    id: 'ex-4',
    name: 'Dumbbell Row',
    category: 'strength',
    muscleGroups: ['back', 'biceps'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 20,
    description: 'An exercise for upper back and arm strength',
    instructions: 'Bend at the waist with one hand on a bench. Pull the dumbbell up to your side, keeping your elbow close to your body.',
    isCustom: false
  },
  {
    id: 'ex-5',
    name: 'Shoulder Press',
    category: 'strength',
    muscleGroups: ['shoulders', 'triceps'],
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 15,
    description: 'A compound exercise for shoulder strength',
    instructions: 'Sit or stand with dumbbells at shoulder height. Press the weights upward until your arms are extended, then lower back down.',
    isCustom: false
  },
  
  // Strength - Lower Body
  {
    id: 'ex-6',
    name: 'Squat',
    category: 'strength',
    muscleGroups: ['quadriceps', 'hamstrings', 'glutes'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 60,
    description: 'A compound exercise for lower body strength',
    instructions: 'Stand with feet shoulder-width apart. Bend your knees and hips to lower your body as if sitting in a chair, then return to standing.',
    isCustom: false
  },
  {
    id: 'ex-7',
    name: 'Deadlift',
    category: 'strength',
    muscleGroups: ['lower back', 'hamstrings', 'glutes'],
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 80,
    description: 'A compound exercise for posterior chain strength',
    instructions: 'Stand with feet hip-width apart, barbell over feet. Bend at hips and knees to grip the bar, then stand up by driving through your heels.',
    isCustom: false
  },
  {
    id: 'ex-8',
    name: 'Lunge',
    category: 'strength',
    muscleGroups: ['quadriceps', 'hamstrings', 'glutes'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 20,
    description: 'A unilateral exercise for lower body strength',
    instructions: 'Stand with feet together. Step forward with one foot and lower your body until both knees are bent at 90 degrees, then return to standing.',
    isCustom: false
  },
  {
    id: 'ex-9',
    name: 'Leg Press',
    category: 'strength',
    muscleGroups: ['quadriceps', 'hamstrings', 'glutes'],
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 100,
    description: 'A machine exercise for lower body strength',
    instructions: 'Sit in the leg press machine with feet on the platform. Push the platform away by extending your knees, then slowly return to the starting position.',
    isCustom: false
  },
  
  // Cardio
  {
    id: 'ex-10',
    name: 'Running',
    category: 'cardio',
    muscleGroups: ['quadriceps', 'hamstrings', 'calves', 'heart'],
    description: 'A cardiovascular exercise for endurance and heart health',
    instructions: 'Run at a steady pace, landing on the middle of your foot and keeping your posture upright.',
    isCustom: false
  },
  {
    id: 'ex-11',
    name: 'Cycling',
    category: 'cardio',
    muscleGroups: ['quadriceps', 'hamstrings', 'calves', 'heart'],
    description: 'A low-impact cardiovascular exercise',
    instructions: 'Cycle at a moderate intensity, maintaining a cadence of around 80-100 rpm.',
    isCustom: false
  },
  {
    id: 'ex-12',
    name: 'Jumping Rope',
    category: 'cardio',
    muscleGroups: ['calves', 'shoulders', 'heart'],
    description: 'A high-intensity cardiovascular exercise',
    instructions: 'Jump rope with both feet together, keeping jumps small and landing on the balls of your feet.',
    isCustom: false
  },
  
  // Flexibility
  {
    id: 'ex-13',
    name: 'Hamstring Stretch',
    category: 'flexibility',
    muscleGroups: ['hamstrings'],
    description: 'A stretch for the back of the thighs',
    instructions: 'Sit on the floor with one leg extended and one bent. Reach toward your extended foot, feeling the stretch in your hamstring.',
    isCustom: false
  },
  {
    id: 'ex-14',
    name: 'Chest Stretch',
    category: 'flexibility',
    muscleGroups: ['chest', 'shoulders'],
    description: 'A stretch for the chest and anterior shoulders',
    instructions: 'Stand in a doorway with arms extended at shoulder height. Step forward, feeling the stretch across your chest and shoulders.',
    isCustom: false
  },
  {
    id: 'ex-15',
    name: 'Hip Flexor Stretch',
    category: 'flexibility',
    muscleGroups: ['hip flexors', 'quadriceps'],
    description: 'A stretch for the front of the hips',
    instructions: 'Kneel on one knee with the other foot in front. Push your hips forward, feeling the stretch in the front of your hip on the kneeling side.',
    isCustom: false
  },
  
  // Balance
  {
    id: 'ex-16',
    name: 'Single Leg Stand',
    category: 'balance',
    muscleGroups: ['core', 'ankles'],
    description: 'A simple balance exercise',
    instructions: 'Stand on one leg with the other foot lifted. Try to maintain your balance for 30-60 seconds.',
    isCustom: false
  },
  {
    id: 'ex-17',
    name: 'Yoga Tree Pose',
    category: 'balance',
    muscleGroups: ['core', 'legs'],
    description: 'A yoga pose for balance and focus',
    instructions: 'Stand on one leg with the other foot placed on the inside of your standing thigh. Bring hands together at chest or extend overhead.',
    isCustom: false
  }
];

export const useExerciseLibrary = create<ExerciseLibraryState>()(
  persist(
    (set, get) => ({
      exercises: defaultExercises,
      
      fetchExercises: () => {
        // In a real app, this would fetch from an API
        // For our mock, we'll just set the default exercises if empty
        set((state) => {
          if (state.exercises.length === 0) {
            return { exercises: defaultExercises };
          }
          return state;
        });
      },
      
      addExercise: (exerciseData) => {
        const id = `custom-${Date.now()}`;
        
        set((state) => ({
          exercises: [
            ...state.exercises,
            {
              ...exerciseData,
              id
            }
          ]
        }));
        
        return id;
      },
      
      updateExercise: (id, exerciseData) => {
        set((state) => ({
          exercises: state.exercises.map((exercise) => 
            exercise.id === id 
              ? { ...exercise, ...exerciseData }
              : exercise
          )
        }));
      },
      
      deleteExercise: (id) => {
        set((state) => ({
          exercises: state.exercises.filter((exercise) => 
            // Only allow deletion of custom exercises
            exercise.id !== id || !exercise.isCustom
          )
        }));
      },
      
      getExerciseById: (id) => {
        return get().exercises.find((exercise) => exercise.id === id);
      },
      
      getExercisesByCategory: (category) => {
        return get().exercises.filter((exercise) => exercise.category === category);
      },
      
      getExercisesByMuscleGroup: (muscleGroup) => {
        return get().exercises.filter((exercise) => 
          exercise.muscleGroups.includes(muscleGroup)
        );
      }
    }),
    {
      name: 'mamuk-exercise-library-storage',
    }
  )
); 