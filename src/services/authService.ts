import api from './api';
import tokenService from './tokenService';

// Types
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  fitnessGoals?: string[];
  healthConditions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUpdateData {
  name?: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  fitnessGoals?: string[];
  healthConditions?: string[];
}

// Service functions
export const authService = {
  // Register a new user
  register: async (userData: RegisterData): Promise<UserData> => {
    const response = await api.post('/users/register', userData);
    const data = response.data;
    
    // Store tokens
    if (data.token) {
      tokenService.setToken(data.token, data.expiresIn);
    }
    
    if (data.refreshToken) {
      tokenService.setRefreshToken(data.refreshToken);
    }
    
    // Store user data without sensitive info
    const userToStore = { ...data };
    delete userToStore.token;
    delete userToStore.refreshToken;
    localStorage.setItem('mamuk_user', JSON.stringify(userToStore));
    
    return data;
  },
  
  // Login user
  login: async (credentials: LoginData): Promise<UserData> => {
    const response = await api.post('/users/login', credentials);
    const data = response.data;
    
    // Store tokens
    if (data.token) {
      tokenService.setToken(data.token, data.expiresIn);
    }
    
    if (data.refreshToken) {
      tokenService.setRefreshToken(data.refreshToken);
    }
    
    // Store user data without sensitive info
    const userToStore = { ...data };
    delete userToStore.token;
    delete userToStore.refreshToken;
    localStorage.setItem('mamuk_user', JSON.stringify(userToStore));
    
    // Initialize token refresh mechanism
    tokenService.initTokenRefresh();
    
    return data;
  },
  
  // Logout user
  logout: (): void => {
    tokenService.removeTokens();
    localStorage.removeItem('mamuk_user');
    
    // Optionally notify the server (if you have a logout endpoint)
    const token = tokenService.getToken();
    if (token) {
      api.post('/users/logout')
        .catch(error => console.error('Logout API error:', error));
    }
  },
  
  // Get current user from localStorage
  getCurrentUser: (): UserData | null => {
    const userStr = localStorage.getItem('mamuk_user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  },
  
  // Get user profile from API
  getProfile: async (): Promise<UserData> => {
    // Check if token needs refresh before making the request
    if (tokenService.isTokenExpiringSoon()) {
      await tokenService.refreshToken();
    }
    
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (profileData: ProfileUpdateData): Promise<UserData> => {
    // Check if token needs refresh before making the request
    if (tokenService.isTokenExpiringSoon()) {
      await tokenService.refreshToken();
    }
    
    const response = await api.put('/users/profile', profileData);
    
    // Update stored user data
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('mamuk_user', JSON.stringify(updatedUser));
    }
    
    return response.data;
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!tokenService.getToken();
  },
  
  // Check if user has specific role
  hasRole: (role: string): boolean => {
    const user = authService.getCurrentUser();
    return user !== null && user.role === role;
  }
};

export default authService; 