'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useWorkoutLimitStore } from '@/store/workoutLimitStore';

/**
 * WorkoutLimitProvider
 * 
 * This provider initializes and updates the workout limit store
 * when the user session changes. It should be included in the app
 * layout near the root to ensure the limit is always up-to-date.
 */
export function WorkoutLimitProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { checkLimit, error, saveRoleToLocalStorage } = useWorkoutLimitStore();
  const [hasChecked, setHasChecked] = useState(false);
  
  // Load workout limits when session is available
  useEffect(() => {
    const initializeLimit = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        // Save user roles to localStorage for fallback mechanism
        if (session.user.roles) {
          saveRoleToLocalStorage(session.user.roles);
        }
        
        // Check the limit only once per session to avoid unnecessary API calls
        if (!hasChecked) {
          try {
            console.log('[WorkoutLimitProvider] Initializing limit for user:', session.user.id);
            await checkLimit(session.user.id);
            setHasChecked(true);
          } catch (err) {
            console.error('[WorkoutLimitProvider] Error initializing limit:', err);
          }
        }
      } else if (status === 'unauthenticated') {
        // Reset check state when user logs out
        setHasChecked(false);
      }
    };
    
    initializeLimit();
  }, [session?.user?.id, status, checkLimit, hasChecked, session?.user?.roles, saveRoleToLocalStorage]);
  
  // Refresh the limit periodically if the user is authenticated (every 5 minutes)
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;
    
    const refreshInterval = setInterval(() => {
      console.log('[WorkoutLimitProvider] Refreshing limit for user:', session.user.id);
      checkLimit(session.user.id);
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [session?.user?.id, status, checkLimit]);
  
  // Log any errors from the store
  useEffect(() => {
    if (error) {
      console.error('[WorkoutLimitProvider] Store error:', error);
    }
  }, [error]);
  
  return <>{children}</>;
} 