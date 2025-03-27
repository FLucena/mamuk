import api from './api';

// Types
export interface ProgressEntry {
  id?: string;
  _id?: string;
  user: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    calves?: number;
    [key: string]: number | undefined;
  };
  photos?: Array<string | File>;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgressResponse {
  entries: ProgressEntry[];
  page: number;
  pages: number;
  total: number;
}

export interface ProgressFilters {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ProgressStats {
  weightChange: number;
  bodyFatChange: number;
  measurementChanges: {
    [key: string]: number;
  };
  startWeight?: number;
  currentWeight?: number;
  startBodyFat?: number;
  currentBodyFat?: number;
  startMeasurements?: {
    [key: string]: number;
  };
  currentMeasurements?: {
    [key: string]: number;
  };
}

// Service functions
export const progressService = {
  // Get all progress entries with pagination and filters
  getProgressEntries: async (filters: ProgressFilters = {}): Promise<ProgressResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit.toString());
    }
    
    const response = await api.get(`/progress?${queryParams.toString()}`);
    return response.data;
  },
  
  // Get a single progress entry by ID
  getProgressById: async (id: string): Promise<ProgressEntry> => {
    const response = await api.get(`/progress/${id}`);
    return response.data;
  },
  
  // Create a new progress entry
  createProgressEntry: async (entryData: Omit<ProgressEntry, 'user' | 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<ProgressEntry> => {
    if (entryData.photos && entryData.photos.length > 0 && entryData.photos.some(p => typeof p !== 'string')) {
      // Handle file uploads
      const formData = new FormData();
      
      // Add date and other scalar fields
      if (entryData.date) formData.append('date', entryData.date);
      if (entryData.weight !== undefined) formData.append('weight', entryData.weight.toString());
      if (entryData.bodyFat !== undefined) formData.append('bodyFat', entryData.bodyFat.toString());
      if (entryData.notes) formData.append('notes', entryData.notes);
      
      // Add measurements
      if (entryData.measurements) {
        Object.entries(entryData.measurements).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(`measurements[${key}]`, value.toString());
          }
        });
      }
      
      // Add photos
      if (entryData.photos) {
        entryData.photos.forEach((photo, index) => {
          if (photo instanceof File) {
            formData.append(`photos`, photo);
          } else if (typeof photo === 'string') {
            formData.append(`existingPhotos[${index}]`, photo);
          }
        });
      }
      
      const response = await api.post('/progress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } else {
      // No files to upload, use JSON
      const response = await api.post('/progress', entryData);
      return response.data;
    }
  },
  
  // Update a progress entry
  updateProgressEntry: async (id: string, entryData: Partial<ProgressEntry>): Promise<ProgressEntry> => {
    if (entryData.photos && entryData.photos.length > 0 && entryData.photos.some(p => typeof p !== 'string')) {
      // Handle file uploads
      const formData = new FormData();
      
      // Add scalar fields
      if (entryData.date) formData.append('date', entryData.date);
      if (entryData.weight !== undefined) formData.append('weight', entryData.weight.toString());
      if (entryData.bodyFat !== undefined) formData.append('bodyFat', entryData.bodyFat.toString());
      if (entryData.notes) formData.append('notes', entryData.notes);
      
      // Add measurements
      if (entryData.measurements) {
        Object.entries(entryData.measurements).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(`measurements[${key}]`, value.toString());
          }
        });
      }
      
      // Add photos
      if (entryData.photos) {
        entryData.photos.forEach((photo, index) => {
          if (photo instanceof File) {
            formData.append(`photos`, photo);
          } else if (typeof photo === 'string') {
            formData.append(`existingPhotos[${index}]`, photo);
          }
        });
      }
      
      const response = await api.put(`/progress/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } else {
      // No files to upload, use JSON
      const response = await api.put(`/progress/${id}`, entryData);
      return response.data;
    }
  },
  
  // Delete a progress entry
  deleteProgressEntry: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/progress/${id}`);
    return response.data;
  },
  
  // Get latest progress entry
  getLatestEntry: async (): Promise<ProgressEntry | null> => {
    try {
      const response = await api.get('/progress/latest');
      return response.data;
    } catch {
      // Silently return null if there's an error
      return null;
    }
  },
  
  // Get progress statistics for a time period
  getProgressStats: async (startDate?: string, endDate?: string): Promise<ProgressStats> => {
    const queryParams = new URLSearchParams();
    
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    
    if (endDate) {
      queryParams.append('endDate', endDate);
    }
    
    const response = await api.get(`/progress/stats?${queryParams.toString()}`);
    return response.data;
  },
  
  // Delete a progress photo
  deleteProgressPhoto: async (entryId: string, photoIndex: number): Promise<ProgressEntry> => {
    const response = await api.delete(`/progress/${entryId}/photos/${photoIndex}`);
    return response.data;
  }
};

export default progressService; 