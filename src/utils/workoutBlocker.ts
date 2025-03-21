'use client';

import { useWorkoutLimitStore } from '@/store/workoutLimitStore';

/**
 * @deprecated Use useWorkoutLimitStore directly instead.
 * This hook is maintained for backward compatibility.
 */
export const useWorkoutBlocker = () => {
  const store = useWorkoutLimitStore();
  
  // Return the same interface as before, but now it's directly from the store
  return {
    isBlocked: store.isBlocked,
    isCoachOrAdmin: store.isCoachOrAdmin,
    currentCount: store.currentCount,
    maxAllowed: store.formattedMaxAllowed,
    isLoading: store.isLoading,
    blockAction: store.blockAction,
    checkAndBlockAction: store.checkAndBlockAction,
    showLimitReachedMessage: store.showLimitReachedMessage,
    refresh: (userId: string) => store.forceRefresh(userId)
  };
}; 