import api from './api';

// Types
export interface CoachClient {
  id?: string;
  _id?: string;
  coach: string; // User ID of coach
  client: string; // User ID of client
  coachProfile?: {
    name: string;
    email: string;
    avatar?: string;
  };
  clientProfile?: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'pending' | 'active' | 'declined' | 'terminated';
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoachingResponse {
  relationships: CoachClient[];
  page: number;
  pages: number;
  total: number;
}

export interface CoachingFilters {
  status?: 'pending' | 'active' | 'declined' | 'terminated';
  role?: 'coach' | 'client';
  page?: number;
  limit?: number;
}

// Service functions
export const coachingService = {
  // Get all coaching relationships (as coach or client) with pagination and filters
  getCoachingRelationships: async (filters: CoachingFilters = {}): Promise<CoachingResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.role) {
      queryParams.append('role', filters.role);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit.toString());
    }
    
    const response = await api.get(`/coaching?${queryParams.toString()}`);
    return response.data;
  },
  
  // Get a single coaching relationship by ID
  getCoachingById: async (id: string): Promise<CoachClient> => {
    const response = await api.get(`/coaching/${id}`);
    return response.data;
  },
  
  // Request a new coaching relationship (coach invites client)
  createCoachingRequest: async (clientEmail: string, notes?: string): Promise<CoachClient> => {
    const response = await api.post('/coaching/invite', {
      clientEmail,
      notes
    });
    return response.data;
  },
  
  // Respond to a coaching request (client accepts or declines)
  respondToCoachingRequest: async (id: string, accept: boolean): Promise<CoachClient> => {
    const response = await api.put(`/coaching/${id}/respond`, {
      status: accept ? 'active' : 'declined'
    });
    return response.data;
  },
  
  // Terminate a coaching relationship
  terminateCoachingRelationship: async (id: string, notes?: string): Promise<CoachClient> => {
    const response = await api.put(`/coaching/${id}/terminate`, {
      notes
    });
    return response.data;
  },
  
  // Update coaching relationship notes
  updateCoachingNotes: async (id: string, notes: string): Promise<CoachClient> => {
    const response = await api.put(`/coaching/${id}/notes`, {
      notes
    });
    return response.data;
  },
  
  // Get all active clients (for coaches)
  getMyClients: async (page = 1, limit = 10): Promise<CoachingResponse> => {
    return coachingService.getCoachingRelationships({
      status: 'active',
      role: 'coach',
      page,
      limit
    });
  },
  
  // Get pending client requests (for coaches)
  getPendingClientRequests: async (page = 1, limit = 10): Promise<CoachingResponse> => {
    return coachingService.getCoachingRelationships({
      status: 'pending',
      role: 'coach',
      page,
      limit
    });
  },
  
  // Get my coaches (for clients)
  getMyCoaches: async (page = 1, limit = 10): Promise<CoachingResponse> => {
    return coachingService.getCoachingRelationships({
      status: 'active',
      role: 'client',
      page,
      limit
    });
  },
  
  // Get pending coach invitations (for clients)
  getPendingCoachInvitations: async (page = 1, limit = 10): Promise<CoachingResponse> => {
    return coachingService.getCoachingRelationships({
      status: 'pending',
      role: 'client',
      page,
      limit
    });
  }
};

export default coachingService; 