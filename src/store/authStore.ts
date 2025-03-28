import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService, { RegisterData, LoginData, ProfileUpdateData } from '../services/authService';

export type UserRole = 'customer' | 'coach' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
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
  token?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: ProfileUpdateData) => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      login: async (credentials: LoginData) => {
        try {
          set({ isLoading: true, error: null });
          
          // Call the auth service login method
          const userData = await authService.login(credentials);
          
          set({
            isAuthenticated: true,
            user: userData as unknown as User,
            token: userData.token || null,
            isLoading: false
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error 
              ? error.message 
              : 'Failed to login. Please try again.'
          });
          throw error;
        }
      },
      
      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          
          // Call the auth service register method
          const newUser = await authService.register(userData);
          
          set({
            isAuthenticated: true,
            user: newUser as unknown as User,
            token: newUser.token || null,
            isLoading: false
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error 
              ? error.message 
              : 'Failed to register. Please try again.'
          });
          throw error;
        }
      },
      
      logout: () => {
        // Call the auth service logout method
        authService.logout();
        
        set({
          isAuthenticated: false,
          user: null,
          token: null
        });
      },
      
      updateUser: async (userData: ProfileUpdateData) => {
        try {
          set({ isLoading: true, error: null });
          
          // Call the auth service updateProfile method
          const updatedUser = await authService.updateProfile(userData);
          
          set({
            user: updatedUser as unknown as User,
            isLoading: false
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error 
              ? error.message 
              : 'Failed to update profile. Please try again.'
          });
          throw error;
        }
      },
      
      refreshUserData: async () => {
        try {
          // Only refresh if we're authenticated
          if (!get().isAuthenticated) return;
          
          set({ isLoading: true });
          
          // Get fresh user data from the API
          const userData = await authService.getProfile();
          
          set({
            user: userData as unknown as User,
            isLoading: false
          });
        } catch (error: any) {
          console.error('Error refreshing user data:', error);
          
          // Handle different error types
          if (error?.response?.status === 404) {
            set({ 
              isLoading: false,
              error: 'API endpoint not found. Please check the configuration.'
            });
          } else if (error?.response?.status === 401) {
            authService.logout();
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false
            });
          } else {
            set({ 
              isLoading: false,
              error: error instanceof Error 
                ? error.message 
                : 'Failed to refresh user data. Please try again.'
            });
          }
        }
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'mamuk-auth-storage',
      // Only persist these properties
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token
      })
    }
  )
); 