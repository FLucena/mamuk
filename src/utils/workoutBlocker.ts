'use client';

import { toast } from 'sonner';
import { useWorkoutLimitStore } from '@/store/workoutLimitStore';
import { useSession } from 'next-auth/react';

/**
 * Centralized utility for blocking workout creation/duplication when limit is reached
 */
export const useWorkoutBlocker = () => {
  const { data: session } = useSession();
  const { 
    canCreate, 
    currentCount, 
    maxAllowed, 
    userRole, 
    isLoading,
    forceRefresh 
  } = useWorkoutLimitStore();
  
  const isCoachOrAdmin = userRole === 'admin' || userRole === 'coach';
  
  // Should the action be blocked?
  const isBlocked = !isCoachOrAdmin && !isLoading && !canCreate;
  
  // Show standardized limit reached message
  const showLimitReachedMessage = () => {
    toast.error(`Has alcanzado el límite de ${maxAllowed} rutinas personales. Para crear más, contacta con un entrenador.`);
  };
  
  // Block action and show message
  const blockAction = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    showLimitReachedMessage();
    return true; // Action was blocked
  };
  
  // Check if action should be blocked and block it if needed
  const checkAndBlockAction = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (isBlocked) {
      return blockAction(e);
    }
    return false; // Action was not blocked
  };
  
  // Refresh the workout limit data
  const refresh = () => {
    if (session?.user?.id) {
      forceRefresh(session.user.id);
    }
  };
  
  return {
    isBlocked,
    isCoachOrAdmin,
    currentCount,
    maxAllowed,
    isLoading,
    blockAction,
    checkAndBlockAction,
    showLimitReachedMessage,
    refresh
  };
}; 