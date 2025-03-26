import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number; // Optional for bodyweight exercises
  notes?: string;
}

export interface WorkoutBlock {
  id: string;
  name: string; // e.g., "Warm-up", "Main", "Accessory", "Finisher" 
  exercises: Exercise[];
  isExpanded?: boolean;
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g., "Day 1: Upper Body", "Day 2: Lower Body"
  blocks: WorkoutBlock[];
  isExpanded?: boolean;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  createdBy: string; // User ID
  assignedTo?: string[]; // Array of user IDs (for coaches)
  days: WorkoutDay[];
  createdAt: Date;
  updatedAt: Date;
  completed?: boolean;
}

interface WorkoutState {
  workouts: Workout[];
  fetchWorkouts: () => Promise<void>;
  createWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Workout>;
  updateWorkout: (id: string, workout: Partial<Omit<Workout, 'id'>>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  getWorkoutById: (id: string) => Workout | undefined;
  toggleWorkoutCompleted: (id: string, completed: boolean) => Promise<void>;
}

// Default block names for new days
export const DEFAULT_BLOCK_NAMES = ["Warm-up", "Main", "Accessory", "Finisher"];

// Mock data
const mockWorkouts: Workout[] = [
  {
    id: '1',
    title: 'Full Body Workout',
    description: 'A complete full body workout targeting all major muscle groups',
    createdBy: '2', // Coach
    assignedTo: ['1'], // User
    days: [
      {
        id: '1-1',
        name: 'Day 1: Full Body',
        isExpanded: true,
        blocks: [
          {
            id: '1-1-1',
            name: 'Warm-up',
            isExpanded: true,
            exercises: [
              {
                id: '1',
                name: 'Jumping Jacks',
                sets: 1,
                reps: 30,
                notes: 'Get the blood flowing'
              }
            ]
          },
          {
            id: '1-1-2',
            name: 'Main',
            isExpanded: true,
            exercises: [
              {
                id: '2',
                name: 'Push-ups',
                sets: 3,
                reps: 12,
                notes: 'Keep your core tight'
              },
              {
                id: '3',
                name: 'Squats',
                sets: 4,
                reps: 15,
                notes: 'Go deep'
              }
            ]
          },
          {
            id: '1-1-3',
            name: 'Accessory',
            isExpanded: true,
            exercises: [
              {
                id: '4',
                name: 'Bench Press',
                sets: 3,
                reps: 8,
                weight: 60,
              }
            ]
          },
          {
            id: '1-1-4',
            name: 'Finisher',
            isExpanded: true,
            exercises: [
              {
                id: '5',
                name: 'Plank',
                sets: 3,
                reps: 1,
                notes: 'Hold for 30 seconds'
              }
            ]
          }
        ]
      }
    ],
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-10'),
  },
  {
    id: '2',
    title: 'Split Training Program',
    description: 'A 2-day split focusing on upper and lower body',
    createdBy: '2', // Coach
    assignedTo: ['1'], // User
    days: [
      {
        id: '2-1',
        name: 'Day 1: Leg Day',
        isExpanded: true,
        blocks: [
          {
            id: '2-1-1',
            name: 'Warm-up',
            isExpanded: true,
            exercises: [
              {
                id: '1',
                name: 'Leg Swings',
                sets: 1,
                reps: 15,
                notes: 'Each leg'
              }
            ]
          },
          {
            id: '2-1-2',
            name: 'Main',
            isExpanded: true,
            exercises: [
              {
                id: '2',
                name: 'Squats',
                sets: 4,
                reps: 10,
                weight: 80,
              }
            ]
          },
          {
            id: '2-1-3',
            name: 'Accessory',
            isExpanded: true,
            exercises: [
              {
                id: '3',
                name: 'Lunges',
                sets: 3,
                reps: 12,
                weight: 20,
              }
            ]
          },
          {
            id: '2-1-4',
            name: 'Finisher',
            isExpanded: true,
            exercises: [
              {
                id: '4',
                name: 'Leg Press',
                sets: 3,
                reps: 10,
                weight: 120,
              }
            ]
          }
        ]
      },
      {
        id: '2-2',
        name: 'Day 2: Upper Body',
        isExpanded: true,
        blocks: [
          {
            id: '2-2-1',
            name: 'Warm-up',
            isExpanded: true,
            exercises: [
              {
                id: '5',
                name: 'Arm Circles',
                sets: 1,
                reps: 20,
                notes: 'Forward and backward'
              }
            ]
          },
          {
            id: '2-2-2',
            name: 'Main',
            isExpanded: true,
            exercises: [
              {
                id: '6',
                name: 'Pull-ups',
                sets: 3,
                reps: 8,
              }
            ]
          },
          {
            id: '2-2-3',
            name: 'Accessory',
            isExpanded: true,
            exercises: [
              {
                id: '7',
                name: 'Bench Press',
                sets: 3,
                reps: 10,
                weight: 60,
              }
            ]
          },
          {
            id: '2-2-4',
            name: 'Finisher',
            isExpanded: true,
            exercises: [
              {
                id: '8',
                name: 'Push-ups',
                sets: 3,
                reps: 12,
              }
            ]
          }
        ]
      }
    ],
    createdAt: new Date('2025-03-05'),
    updatedAt: new Date('2025-03-05'),
  },
  {
    id: '3',
    title: 'Upper Body Push',
    description: 'Chest, shoulders, and triceps workout',
    createdBy: '1', // User (created their own workout)
    days: [
      {
        id: '3-1',
        name: 'Push Day',
        isExpanded: true,
        blocks: [
          {
            id: '3-1-1',
            name: 'Warm-up',
            isExpanded: true,
            exercises: [
              {
                id: '1',
                name: 'Shoulder Rotations',
                sets: 1,
                reps: 20,
                notes: 'Loosen up the shoulder joints'
              }
            ]
          },
          {
            id: '3-1-2',
            name: 'Main',
            isExpanded: true,
            exercises: [
              {
                id: '2',
                name: 'Push-ups',
                sets: 3,
                reps: 15,
              }
            ]
          },
          {
            id: '3-1-3',
            name: 'Accessory',
            isExpanded: true,
            exercises: [
              {
                id: '3',
                name: 'Shoulder Press',
                sets: 3,
                reps: 10,
                weight: 15,
              }
            ]
          },
          {
            id: '3-1-4',
            name: 'Finisher',
            isExpanded: true,
            exercises: [
              {
                id: '4',
                name: 'Tricep Dips',
                sets: 3,
                reps: 12,
              }
            ]
          }
        ]
      }
    ],
    createdAt: new Date('2025-03-12'),
    updatedAt: new Date('2025-03-12'),
  }
];

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workouts: mockWorkouts,
      
      fetchWorkouts: async () => {
        // In a real app, this would be an API call
        // For now, we'll just use our mock data
        set({ workouts: mockWorkouts });
        return Promise.resolve();
      },
      
      createWorkout: async (workoutData) => {
        // Generate a new workout with an ID and timestamps
        const newWorkout: Workout = {
          ...workoutData,
          id: `${get().workouts.length + 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Add the new workout to the store
        set((state) => ({
          workouts: [...state.workouts, newWorkout],
        }));
        
        return Promise.resolve(newWorkout);
      },
      
      updateWorkout: async (id, workoutData) => {
        set((state) => ({
          workouts: state.workouts.map((workout) => 
            workout.id === id 
              ? { 
                  ...workout, 
                  ...workoutData, 
                  updatedAt: new Date() 
                } 
              : workout
          ),
        }));
        
        return Promise.resolve();
      },
      
      deleteWorkout: async (id) => {
        set((state) => ({
          workouts: state.workouts.filter((workout) => workout.id !== id),
        }));
        
        return Promise.resolve();
      },
      
      getWorkoutById: (id) => {
        return get().workouts.find((workout) => workout.id === id);
      },
      
      toggleWorkoutCompleted: async (id, completed) => {
        set((state) => ({
          workouts: state.workouts.map((workout) => 
            workout.id === id 
              ? { 
                  ...workout, 
                  completed: completed 
                } 
              : workout
          ),
        }));
        
        return Promise.resolve();
      },
    }),
    {
      name: 'mamuk-workouts-storage',
    }
  )
); 