'use client';

import { create } from 'zustand';
import { toast } from 'sonner';
// Remove direct import of server action
// import { checkWorkoutLimit } from '@/app/workout/[id]/actions';

// Safe localStorage accessor
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
  }
};

interface WorkoutLimitState {
  // State
  canCreate: boolean;
  currentCount: number;
  maxAllowed: number | null;  // Allow null in the type definition
  userRole: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Derived state (computed values)
  isCoachOrAdmin: boolean;
  formattedMaxAllowed: number; // Always a number (Infinity for unlimited)
  isBlocked: boolean;
  
  // Actions
  checkLimit: (userId: string) => Promise<void>;
  reset: () => void;
  forceRefresh: (userId: string) => Promise<void>;
  
  // Workout blocker actions
  blockAction: (e?: React.MouseEvent | React.KeyboardEvent) => boolean;
  checkAndBlockAction: (e?: React.MouseEvent | React.KeyboardEvent) => boolean;
  showLimitReachedMessage: () => void;
  saveRoleToLocalStorage: (userRoles?: string[]) => void;
}

/**
 * Helper function to call the workout limit API
 */
async function fetchWorkoutLimit(userId: string) {
  try {
    const response = await fetch('/api/workout/check-limit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[fetchWorkoutLimit] Error calling API:', error);
    throw error;
  }
}

/**
 * Helper function to format maxAllowed based on user role
 * This ensures consistent handling throughout the application
 */
function formatMaxAllowed(maxAllowed: number | null, userRole: string): number {
  // If user is admin or coach, they have unlimited access
  if (userRole === 'admin' || userRole === 'coach') {
    return Infinity;
  }
  
  // For regular users, convert null to Infinity or use the provided value
  return maxAllowed === null ? Infinity : (maxAllowed || 3);
}

/**
 * Helper function to check if a user is an admin or coach based on role
 */
function isUserCoachOrAdmin(userRole: string, userRoles?: string[]): boolean {
  // Check from the store's userRole
  if (userRole === 'admin' || userRole === 'coach') {
    return true;
  }
  
  // Check from user roles array if provided
  if (userRoles && Array.isArray(userRoles)) {
    return userRoles.includes('admin') || userRoles.includes('coach');
  }
  
  // Check from localStorage as fallback (helps with SSR and page refresh)
  const storedRole = safeLocalStorage.getItem('userRole');
  if (storedRole === 'admin' || storedRole === 'coach') {
    return true;
  }
  
  return false;
}

export const useWorkoutLimitStore = create<WorkoutLimitState>((set, get) => ({
  // Initial state
  canCreate: false,
  currentCount: 0,
  maxAllowed: 3,
  userRole: 'unknown',
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  // Derived state with default values
  isCoachOrAdmin: false,
  formattedMaxAllowed: 3, 
  isBlocked: false,
  
  // Save user role to localStorage for fallback mechanism
  saveRoleToLocalStorage: (userRoles) => {
    try {
      const state = get();
      const userRole = state.userRole;
      
      if (userRole === 'admin' || userRole === 'coach') {
        safeLocalStorage.setItem('userRole', userRole);
        return;
      }
      
      if (userRoles) {
        if (userRoles.includes('admin')) {
          safeLocalStorage.setItem('userRole', 'admin');
        } else if (userRoles.includes('coach')) {
          safeLocalStorage.setItem('userRole', 'coach');
        } else if (userRoles.includes('customer')) {
          safeLocalStorage.setItem('userRole', 'customer');
        }
      }
    } catch (error) {
      console.error('[WorkoutLimitStore] Error saving role to localStorage:', error);
    }
  },
  
  // Check if user has reached workout limit
  checkLimit: async (userId: string) => {
    // Don't fetch again if we already have data and it's recent (within 60 seconds)
    const state = get();
    const now = Date.now();
    const isCacheValid = state.lastUpdated && (now - state.lastUpdated < 60000);
    
    if (isCacheValid && !state.isLoading) {
      console.log('[WorkoutLimitStore] Using cached limit data');
      
      // Update derived state values even when using cached data
      const isCoachOrAdmin = isUserCoachOrAdmin(state.userRole);
      const formattedMaxAllowed = isCoachOrAdmin ? Infinity : formatMaxAllowed(state.maxAllowed, state.userRole);
      const isBlocked = !isCoachOrAdmin && !state.isLoading && !state.canCreate;
      
      set({
        isCoachOrAdmin,
        formattedMaxAllowed,
        isBlocked
      });
      
      return;
    }
    
    if (!userId) {
      set({ 
        error: 'No user ID provided', 
        isLoading: false,
        isCoachOrAdmin: false,
        formattedMaxAllowed: 3,
        isBlocked: true
      });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      console.log('[WorkoutLimitStore] Checking workout limit for user:', userId);
      
      // Use the API endpoint instead of direct server action
      const result = await fetchWorkoutLimit(userId);
      
      if (!result) {
        throw new Error('No result received from API');
      }
      
      console.log('[WorkoutLimitStore] Successfully received result:', result);
      
      // Determine if the user is a coach or admin
      const isCoachOrAdmin = isUserCoachOrAdmin(result.userRole);
      
      // Format maxAllowed based on user role
      const formattedMaxAllowed = isCoachOrAdmin ? Infinity : formatMaxAllowed(result.maxAllowed, result.userRole);
      
      // Determine if action should be blocked
      const isBlocked = !isCoachOrAdmin && !result.canCreate;
      
      // Detailed logging of values processing
      console.log('[WorkoutLimitStore] Processing values:', {
        original: result.maxAllowed,
        userRole: result.userRole,
        isCoachOrAdmin,
        formattedMaxAllowed,
        isBlocked
      });
      
      // Update store with the result and computed values
      set({
        canCreate: result.canCreate,
        currentCount: result.currentCount || 0,
        maxAllowed: result.maxAllowed,  // Keep the original value for reference
        userRole: result.userRole || 'unknown',
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
        isCoachOrAdmin,
        formattedMaxAllowed,
        isBlocked
      });
      
      // Log the final state for debugging
      const updatedState = get();
      console.log('[WorkoutLimitStore] Updated state:', {
        canCreate: updatedState.canCreate,
        currentCount: updatedState.currentCount,
        maxAllowed: updatedState.maxAllowed,
        formattedMaxAllowed: updatedState.formattedMaxAllowed,
        userRole: updatedState.userRole,
        isCoachOrAdmin: updatedState.isCoachOrAdmin,
        isBlocked: updatedState.isBlocked
      });
      
    } catch (error) {
      console.error('[WorkoutLimitStore] Error checking workout limit:', error);
      
      // If we get an error, we should set reasonable defaults that won't block admins
      // Check if there's admin/coach info in localStorage as a fallback
      const userRoleFromStorage = safeLocalStorage.getItem('userRole');
      const isCoachOrAdmin = userRoleFromStorage === 'admin' || userRoleFromStorage === 'coach';
      
      set({
        isLoading: false,
        // If we have role info from localStorage and user is admin/coach, allow creation
        canCreate: isCoachOrAdmin ? true : get().canCreate,
        userRole: isCoachOrAdmin ? userRoleFromStorage : get().userRole,
        // If admin or coach, set formattedMaxAllowed to Infinity
        formattedMaxAllowed: isCoachOrAdmin ? Infinity : 3,
        isCoachOrAdmin,
        isBlocked: !isCoachOrAdmin && !get().canCreate,
        error: error instanceof Error ? error.message : 'Error checking workout limit',
        lastUpdated: Date.now() // Still update timestamp to prevent constant retries
      });
    }
  },
  
  // Show standardized limit reached message
  showLimitReachedMessage: () => {
    const state = get();
    const limitText = state.formattedMaxAllowed === Infinity ? 'rutinas' : state.formattedMaxAllowed;
    toast.error(`Has alcanzado el límite de ${limitText} personales. Para crear más, contacta con un entrenador.`);
  },
  
  // Block action and show message
  blockAction: (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    get().showLimitReachedMessage();
    return true; // Action was blocked
  },
  
  // Check if action should be blocked and block it if needed
  checkAndBlockAction: (e?: React.MouseEvent | React.KeyboardEvent) => {
    const state = get();
    if (state.isBlocked) {
      return state.blockAction(e);
    }
    return false; // Action was not blocked
  },
  
  // Force refresh data, ignoring cache
  forceRefresh: async (userId: string) => {
    if (!userId) {
      set({ 
        error: 'No user ID provided', 
        isLoading: false,
        isCoachOrAdmin: false,
        formattedMaxAllowed: 3,
        isBlocked: true
      });
      return;
    }
    
    set({ isLoading: true, lastUpdated: null });
    
    try {
      console.log('[WorkoutLimitStore] Force refreshing workout limit for user:', userId);
      
      // Use the API endpoint for force refresh too
      const result = await fetchWorkoutLimit(userId);
      
      if (!result) {
        throw new Error('No result received from API');
      }
      
      console.log('[WorkoutLimitStore] Refreshed result:', result);
      
      // Determine if the user is a coach or admin
      const isCoachOrAdmin = isUserCoachOrAdmin(result.userRole);
      
      // Format maxAllowed based on user role
      const formattedMaxAllowed = isCoachOrAdmin ? Infinity : formatMaxAllowed(result.maxAllowed, result.userRole);
      
      // Determine if action should be blocked
      const isBlocked = !isCoachOrAdmin && !result.canCreate;
      
      // Update store with the result and computed values
      set({
        canCreate: result.canCreate,
        currentCount: result.currentCount || 0,
        maxAllowed: result.maxAllowed,  // Keep the original value for reference
        userRole: result.userRole || 'unknown',
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
        isCoachOrAdmin,
        formattedMaxAllowed,
        isBlocked
      });
    } catch (error) {
      console.error('[WorkoutLimitStore] Error during force refresh:', error);
      
      // If we get an error, we should set reasonable defaults that won't block admins
      // Check if there's admin/coach info in localStorage as a fallback
      const userRoleFromStorage = safeLocalStorage.getItem('userRole');
      const isCoachOrAdmin = userRoleFromStorage === 'admin' || userRoleFromStorage === 'coach';
      
      set({
        isLoading: false,
        // If we have role info from localStorage and user is admin/coach, allow creation
        canCreate: isCoachOrAdmin ? true : get().canCreate,
        userRole: isCoachOrAdmin ? userRoleFromStorage : get().userRole,
        // If admin or coach, set formattedMaxAllowed to Infinity
        formattedMaxAllowed: isCoachOrAdmin ? Infinity : 3,
        isCoachOrAdmin,
        isBlocked: !isCoachOrAdmin && !get().canCreate,
        error: error instanceof Error ? error.message : 'Error checking workout limit',
        lastUpdated: Date.now()
      });
    }
  },
  
  // Reset store to initial state
  reset: () => set({
    canCreate: false,
    currentCount: 0,
    maxAllowed: 3,
    userRole: 'unknown',
    isLoading: false,
    error: null,
    lastUpdated: null,
    isCoachOrAdmin: false,
    formattedMaxAllowed: 3,
    isBlocked: false
  })
})); 