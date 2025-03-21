'use client';

import { create } from 'zustand';
// Remove direct import of server action
// import { checkWorkoutLimit } from '@/app/workout/[id]/actions';

interface WorkoutLimitState {
  // State
  canCreate: boolean;
  currentCount: number;
  maxAllowed: number;
  userRole: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Actions
  checkLimit: (userId: string) => Promise<void>;
  reset: () => void;
  forceRefresh: (userId: string) => Promise<void>;
}

/**
 * Helper function to call the workout limit API
 */
async function fetchWorkoutLimit(userId: string) {
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
  
  // Check if user has reached workout limit
  checkLimit: async (userId: string) => {
    // Don't fetch again if we already have data and it's recent (within 60 seconds)
    const state = get();
    const now = Date.now();
    const isCacheValid = state.lastUpdated && (now - state.lastUpdated < 60000);
    
    if (isCacheValid && !state.isLoading) {
      console.log('[WorkoutLimitStore] Using cached limit data');
      return;
    }
    
    if (!userId) {
      set({ error: 'No user ID provided', isLoading: false });
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
      
      // Update store with the result
      set({
        canCreate: result.canCreate,
        currentCount: result.currentCount,
        maxAllowed: result.maxAllowed,
        userRole: result.userRole,
        isLoading: false,
        error: null,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('[WorkoutLimitStore] Error checking workout limit:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error checking workout limit',
        lastUpdated: Date.now() // Still update timestamp to prevent constant retries
      });
    }
  },
  
  // Force refresh data, ignoring cache
  forceRefresh: async (userId: string) => {
    if (!userId) {
      set({ error: 'No user ID provided', isLoading: false });
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
      
      // Update store with the result
      set({
        canCreate: result.canCreate,
        currentCount: result.currentCount,
        maxAllowed: result.maxAllowed,
        userRole: result.userRole,
        isLoading: false,
        error: null,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('[WorkoutLimitStore] Error during force refresh:', error);
      set({
        isLoading: false,
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
    lastUpdated: null
  })
})); 