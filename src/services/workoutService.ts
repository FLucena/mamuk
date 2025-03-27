import api from './api';

// Types
export interface WorkoutExercise {
  id?: string;
  exercise: string; // Exercise ID
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

export interface WorkoutBlock {
  id?: string;
  name: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutDay {
  id?: string;
  name: string;
  day: number;
  blocks: WorkoutBlock[];
}

export interface Workout {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  createdBy?: string;
  assignedTo?: string[];
  days: WorkoutDay[];
  startDate?: string;
  endDate?: string;
  frequency?: string;
  isTemplate?: boolean;
  completed?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  goals?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutsResponse {
  workouts: Workout[];
  page: number;
  pages: number;
  total: number;
}

export interface WorkoutFilters {
  completed?: boolean;
  isTemplate?: boolean;
  page?: number;
  limit?: number;
}

// Service functions
export const workoutService = {
  // Get all workouts with pagination and filters
  getWorkouts: async (filters: WorkoutFilters = {}): Promise<WorkoutsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters.completed !== undefined) {
      queryParams.append('completed', filters.completed.toString());
    }
    
    if (filters.isTemplate !== undefined) {
      queryParams.append('isTemplate', filters.isTemplate.toString());
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit.toString());
    }
    
    const response = await api.get(`/workouts?${queryParams.toString()}`);
    return response.data;
  },
  
  // Get a single workout by ID
  getWorkoutById: async (id: string): Promise<Workout> => {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  },
  
  // Create a new workout
  createWorkout: async (workoutData: Workout): Promise<Workout> => {
    const response = await api.post('/workouts', workoutData);
    return response.data;
  },
  
  // Update a workout
  updateWorkout: async (id: string, workoutData: Partial<Workout>): Promise<Workout> => {
    const response = await api.put(`/workouts/${id}`, workoutData);
    return response.data;
  },
  
  // Delete a workout
  deleteWorkout: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  },
  
  // Toggle workout completion status
  toggleWorkoutCompletion: async (id: string): Promise<{ _id: string; completed: boolean }> => {
    const response = await api.put(`/workouts/${id}/toggle-completion`);
    return response.data;
  },
  
  // Get workout templates
  getWorkoutTemplates: async (page = 1, limit = 10): Promise<WorkoutsResponse> => {
    return workoutService.getWorkouts({
      isTemplate: true,
      page,
      limit
    });
  },
  
  // Get user's active (non-completed) workouts
  getActiveWorkouts: async (page = 1, limit = 10): Promise<WorkoutsResponse> => {
    return workoutService.getWorkouts({
      completed: false,
      isTemplate: false,
      page,
      limit
    });
  },
  
  // Get user's completed workouts
  getCompletedWorkouts: async (page = 1, limit = 10): Promise<WorkoutsResponse> => {
    return workoutService.getWorkouts({
      completed: true,
      isTemplate: false,
      page,
      limit
    });
  },
  
  // Create a workout from a template
  createFromTemplate: async (templateId: string, customData: Partial<Workout> = {}): Promise<Workout> => {
    // First get the template
    const template = await workoutService.getWorkoutById(templateId);
    
    // Create a new workout based on the template, but without template-specific fields
    const newWorkout: Workout = {
      ...template,
      ...customData,
      isTemplate: false,
      completed: false,
    };
    
    // Remove fields that should not be copied
    delete newWorkout._id;
    delete newWorkout.id;
    delete newWorkout.createdAt;
    delete newWorkout.updatedAt;
    
    // Create the new workout
    return workoutService.createWorkout(newWorkout);
  }
};

export default workoutService; 