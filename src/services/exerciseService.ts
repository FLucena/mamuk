import api from './api';

// Types
export interface Equipment {
  id?: string;
  _id?: string;
  name: string;
}

export interface MuscleGroup {
  id?: string;
  _id?: string;
  name: string;
}

export interface Exercise {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  muscleGroups: string[] | MuscleGroup[];
  secondaryMuscleGroups?: string[] | MuscleGroup[];
  equipment?: string[] | Equipment[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric' | 'other';
  instructions?: string[];
  notes?: string;
  image?: string | File;
  video?: string;
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // Better typing than 'any'
}

export interface ExercisesResponse {
  exercises: Exercise[];
  page: number;
  pages: number;
  total: number;
}

export interface ExerciseFilters {
  muscleGroups?: string[];
  equipment?: string[];
  difficulty?: string;
  category?: string;
  query?: string;
  isCustom?: boolean;
  page?: number;
  limit?: number;
}

// Service functions
export const exerciseService = {
  // Get all exercises with pagination and filters
  getExercises: async (filters: ExerciseFilters = {}): Promise<ExercisesResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters.muscleGroups && filters.muscleGroups.length > 0) {
      filters.muscleGroups.forEach(mg => queryParams.append('muscleGroups', mg));
    }
    
    if (filters.equipment && filters.equipment.length > 0) {
      filters.equipment.forEach(eq => queryParams.append('equipment', eq));
    }
    
    if (filters.difficulty) {
      queryParams.append('difficulty', filters.difficulty);
    }
    
    if (filters.category) {
      queryParams.append('category', filters.category);
    }
    
    if (filters.query) {
      queryParams.append('query', filters.query);
    }
    
    if (filters.isCustom !== undefined) {
      queryParams.append('isCustom', filters.isCustom.toString());
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit.toString());
    }
    
    const response = await api.get(`/exercises?${queryParams.toString()}`);
    return response.data;
  },
  
  // Get a single exercise by ID
  getExerciseById: async (id: string): Promise<Exercise> => {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },
  
  // Create a custom exercise
  createExercise: async (exerciseData: Exercise): Promise<Exercise> => {
    const formData = new FormData();
    
    // Add all fields to formData
    Object.entries(exerciseData).forEach(([key, value]) => {
      if (key === 'image' && value && typeof value !== 'string') {
        formData.append('image', value as File);
      } else if (key === 'muscleGroups' || key === 'secondaryMuscleGroups' || key === 'equipment' || key === 'instructions') {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'string') {
              formData.append(`${key}[${index}]`, item);
            } else if (typeof item === 'object' && item !== null && '_id' in item) {
              const itemId = item._id;
              if (itemId) {
                formData.append(`${key}[${index}]`, itemId as string);
              }
            }
          });
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    // Set isCustom flag
    formData.append('isCustom', 'true');
    
    const response = await api.post('/exercises', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  // Update an exercise
  updateExercise: async (id: string, exerciseData: Partial<Exercise>): Promise<Exercise> => {
    // Use FormData if there's an image file, otherwise use JSON
    if (exerciseData.image && typeof exerciseData.image !== 'string') {
      const formData = new FormData();
      
      Object.entries(exerciseData).forEach(([key, value]) => {
        if (key === 'image' && value && typeof value !== 'string') {
          formData.append('image', value as File);
        } else if (key === 'muscleGroups' || key === 'secondaryMuscleGroups' || key === 'equipment' || key === 'instructions') {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === 'string') {
                formData.append(`${key}[${index}]`, item);
              } else if (typeof item === 'object' && item !== null && '_id' in item) {
                const itemId = item._id;
                if (itemId) {
                  formData.append(`${key}[${index}]`, itemId as string);
                }
              }
            });
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      const response = await api.put(`/exercises/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } else {
      // Process arrays to ensure we're sending IDs, not objects
      const processedData = { ...exerciseData } as Record<string, unknown>;
      
      ['muscleGroups', 'secondaryMuscleGroups', 'equipment'].forEach(key => {
        const arrayValue = processedData[key] as Array<string | { _id?: string }> | undefined;
        if (Array.isArray(arrayValue)) {
          processedData[key] = arrayValue.map(item => 
            typeof item === 'string' ? item : (item._id || item)
          );
        }
      });
      
      const response = await api.put(`/exercises/${id}`, processedData);
      return response.data;
    }
  },
  
  // Delete an exercise
  deleteExercise: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/exercises/${id}`);
    return response.data;
  },
  
  // Get all muscle groups
  getMuscleGroups: async (): Promise<MuscleGroup[]> => {
    const response = await api.get('/exercises/muscle-groups');
    return response.data;
  },
  
  // Get all equipment
  getEquipment: async (): Promise<Equipment[]> => {
    const response = await api.get('/exercises/equipment');
    return response.data;
  },
  
  // Get custom exercises
  getCustomExercises: async (page = 1, limit = 10): Promise<ExercisesResponse> => {
    return exerciseService.getExercises({
      isCustom: true,
      page,
      limit
    });
  }
};

export default exerciseService; 