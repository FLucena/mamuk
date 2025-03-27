import api from './api';

// Types
export interface ExerciseSet {
  id?: string;
  _id?: string;
  weight?: number;
  reps: number;
  completed: boolean;
  notes?: string;
}

export interface SessionExercise {
  id?: string;
  _id?: string;
  exercise: string; // Exercise ID
  exerciseReference?: any; // Populated exercise data
  sets: ExerciseSet[];
  completed: boolean;
  notes?: string;
}

export interface SessionBlock {
  id?: string;
  _id?: string;
  name: string;
  exercises: SessionExercise[];
  completed: boolean;
}

export interface WorkoutSession {
  id?: string;
  _id?: string;
  workout: string; // Workout ID
  workoutReference?: any; // Populated workout data
  user: string; // User ID
  date: string;
  duration?: number; // Duration in minutes
  blocks: SessionBlock[];
  completed: boolean;
  notes?: string;
  rating?: number; // 1-5 rating
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutSessionsResponse {
  sessions: WorkoutSession[];
  page: number;
  pages: number;
  total: number;
}

export interface SessionFilters {
  workout?: string;
  startDate?: string;
  endDate?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
}

// Service functions
export const workoutSessionService = {
  // Get all workout sessions with pagination and filters
  getSessions: async (filters: SessionFilters = {}): Promise<WorkoutSessionsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters.workout) {
      queryParams.append('workout', filters.workout);
    }
    
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    
    if (filters.completed !== undefined) {
      queryParams.append('completed', filters.completed.toString());
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit.toString());
    }
    
    const response = await api.get(`/workout-sessions?${queryParams.toString()}`);
    return response.data;
  },
  
  // Get a single workout session by ID
  getSessionById: async (id: string): Promise<WorkoutSession> => {
    const response = await api.get(`/workout-sessions/${id}`);
    return response.data;
  },
  
  // Start a new workout session from a workout
  startSession: async (workoutId: string): Promise<WorkoutSession> => {
    const response = await api.post('/workout-sessions/start', { workout: workoutId });
    return response.data;
  },
  
  // Update a workout session (e.g., log sets, notes)
  updateSession: async (id: string, sessionData: Partial<WorkoutSession>): Promise<WorkoutSession> => {
    const response = await api.put(`/workout-sessions/${id}`, sessionData);
    return response.data;
  },
  
  // Complete a workout session
  completeSession: async (
    id: string, 
    completionData: { 
      duration?: number; 
      notes?: string; 
      rating?: number; 
    } = {}
  ): Promise<WorkoutSession> => {
    const response = await api.put(`/workout-sessions/${id}/complete`, {
      ...completionData,
      completed: true
    });
    return response.data;
  },
  
  // Toggle completion of an exercise set
  toggleSetCompletion: async (
    sessionId: string,
    blockId: string,
    exerciseId: string,
    setId: string,
    completed: boolean
  ): Promise<WorkoutSession> => {
    const response = await api.put(`/workout-sessions/${sessionId}/toggle-set`, {
      blockId,
      exerciseId,
      setId,
      completed
    });
    return response.data;
  },
  
  // Log weight and reps for a set
  logSet: async (
    sessionId: string,
    blockId: string,
    exerciseId: string,
    setId: string,
    data: {
      weight?: number;
      reps?: number;
      notes?: string;
    }
  ): Promise<WorkoutSession> => {
    const response = await api.put(`/workout-sessions/${sessionId}/log-set`, {
      blockId,
      exerciseId,
      setId,
      ...data
    });
    return response.data;
  },
  
  // Delete a workout session
  deleteSession: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/workout-sessions/${id}`);
    return response.data;
  },
  
  // Get user's active (non-completed) sessions
  getActiveSessions: async (page = 1, limit = 10): Promise<WorkoutSessionsResponse> => {
    return workoutSessionService.getSessions({
      completed: false,
      page,
      limit
    });
  },
  
  // Get user's completed sessions
  getCompletedSessions: async (page = 1, limit = 10): Promise<WorkoutSessionsResponse> => {
    return workoutSessionService.getSessions({
      completed: true,
      page,
      limit
    });
  },
  
  // Get session history for a specific workout
  getSessionsByWorkout: async (
    workoutId: string, 
    page = 1, 
    limit = 10
  ): Promise<WorkoutSessionsResponse> => {
    return workoutSessionService.getSessions({
      workout: workoutId,
      page,
      limit
    });
  }
};

export default workoutSessionService; 