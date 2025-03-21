'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWorkoutLimitStore } from '@/store/workoutLimitStore';

// This hook maintains the same interface as before but now uses the Zustand store
export function useWorkoutLimit() {
  const sessionId = Math.random().toString(36).substring(7);
  console.warn(`⚠️ useWorkoutLimit hook called [${sessionId}]`);
  
  const { data: session } = useSession();
  const { 
    checkLimit, 
    forceRefresh,
    canCreate,
    currentCount,
    maxAllowed,
    userRole,
    isLoading,
    error 
  } = useWorkoutLimitStore();

  useEffect(() => {
    console.warn(`⚠️ useWorkoutLimit effect running [${sessionId}], user:`, session?.user?.id);
    
    if (session?.user?.id) {
      // We only need to check the limit when the component mounts or the session changes
      checkLimit(session.user.id);
    }
  }, [session?.user?.id, checkLimit, sessionId]);

  console.warn(`⚠️ useWorkoutLimit [${sessionId}] returning state:`, 
    JSON.stringify({
      canCreate,
      currentCount,
      maxAllowed,
      userRole,
      isLoading
    }));

  // Return the same shape of object as the original hook
  return {
    canCreate,
    currentCount, 
    maxAllowed,
    userRole,
    isLoading,
    error,
    // Add a method to force refresh the data when needed
    refresh: session?.user?.id ? () => forceRefresh(session.user.id) : () => {}
  };
} 