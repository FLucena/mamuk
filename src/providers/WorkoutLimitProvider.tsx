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
  const { checkLimit, error } = useWorkoutLimitStore();
  const [hasChecked, setHasChecked] = useState(false);
  
  // Load workout limits when session is available
  useEffect(() => {
    const initializeLimit = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        // Only check once per session to avoid unnecessary API calls
        if (!hasChecked) {
          try {
            console.log('[WorkoutLimitProvider] Initializing limit check with user ID:', session.user.id);
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
  }, [session?.user?.id, status, checkLimit, hasChecked]);
  
  // Log any errors from the store
  useEffect(() => {
    if (error) {
      console.error('[WorkoutLimitProvider] Store error:', error);
    }
  }, [error]);
  
  return <>{children}</>;
} 