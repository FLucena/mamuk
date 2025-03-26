import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'user' | 'coach' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// For demo purposes, we'll use a mock API
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'user@example.com',
    role: 'user',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'coach@example.com',
    role: 'coach',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
];

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      
      login: async (email: string, password: string) => {
        // Simulate API call
        return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            // Find user by email
            const user = mockUsers.find((u) => u.email === email);
            
            if (user && password === 'password') { // For demo purposes
              set({
                isAuthenticated: true,
                user,
                token: 'mock-jwt-token',
              });
              resolve();
            } else {
              reject(new Error('Invalid email or password'));
            }
          }, 1000); // Simulate network delay
        });
      },
      
      register: async (name: string, email: string) => {
        // Simulate API call
        return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            // Check if user already exists
            const existingUser = mockUsers.find((u) => u.email === email);
            
            if (existingUser) {
              reject(new Error('Email already in use'));
            } else {
              // Create new user (in a real app, this would be done on the server)
              // Note: password is not stored in the mock user object for security reasons
              // In a real app, we would hash the password before storing it
              const newUser: User = {
                id: `${mockUsers.length + 1}`,
                name,
                email,
                role: 'user', // Default role
              };
              
              // In a real app, we would add this user to the database
              // For our mock, we'll just log it
              console.log('Registered new user:', newUser);
              
              set({
                isAuthenticated: true,
                user: newUser,
                token: 'mock-jwt-token',
              });
              resolve();
            }
          }, 1000); // Simulate network delay
        });
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },
      
      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'mamuk-auth-storage',
    }
  )
); 