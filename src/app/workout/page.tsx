'use client';

import React, { useState, useEffect, Suspense, memo, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLightSession } from '@/hooks/useOptimizedSession';

// Dynamically import components
const PageLoading = dynamic(() => import('@/components/ui/PageLoading'), {
  loading: () => <div className="animate-pulse">Loading...</div>,
  ssr: false
});

const WorkoutHeaderWrapper = dynamic(() => import('@/components/workout/WorkoutHeaderWrapper'), {
  loading: () => <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
});

const WorkoutList = dynamic(() => import('@/components/workout/WorkoutList'), {
  loading: () => <div className="animate-pulse space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
    ))}
  </div>
});

// Add interface for Workout type
interface Workout {
  _id: string;
  id: string;
  name: string;
  days: any[];  // You might want to define a proper type for days
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Update WorkoutContentProps interface
interface WorkoutContentProps {
  workouts: Workout[];
  isCoach: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  hasPermissionToCreate: boolean;
  userWorkoutCount: number;
  workoutLimitReached: boolean;
  onRefresh: () => void;
}

// Separate component for the workout content
const WorkoutContent = memo(function WorkoutContent({ 
  workouts, 
  isCoach, 
  isAdmin, 
  isCustomer,
  hasPermissionToCreate, 
  userWorkoutCount, 
  workoutLimitReached,
  onRefresh
}: WorkoutContentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await onRefresh();
      toast.success('Lista de rutinas actualizada');
    } catch (error) {
      toast.error('Error al actualizar las rutinas');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Memoize the header component
  const headerComponent = useMemo(() => (
    <WorkoutHeaderWrapper 
      title="Rutinas" 
      hasPermission={!workoutLimitReached}
      workoutCount={isCustomer ? userWorkoutCount : undefined}
      workoutLimit={isCustomer && !isCoach && !isAdmin ? 3 : undefined}
    />
  ), [workoutLimitReached, isCustomer, userWorkoutCount, isCoach, isAdmin]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        {headerComponent}
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refrescar rutinas"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </div>
      
      <Suspense fallback={<div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>}>
        <WorkoutList workouts={workouts} isCoach={isCoach} />
      </Suspense>
      
      {workoutLimitReached && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">
            Has alcanzado el límite de 3 rutinas personales. Para crear más, contacta con un entrenador.
          </p>
        </div>
      )}
    </>
  );
});

export default function WorkoutPage() {
  const { data: session } = useLightSession();
  const router = useRouter();
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isCoach, setIsCoach] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasPermissionToCreate, setHasPermissionToCreate] = useState(false);
  const [userWorkoutCount, setUserWorkoutCount] = useState(0);
  const [workoutLimitReached, setWorkoutLimitReached] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      
      const controller = new AbortController();
      const signal = controller.signal;
      
      const workoutsRes = await fetch('/api/workout', {
        signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!workoutsRes.ok) {
        throw new Error(`Error fetching workouts: ${workoutsRes.status} ${workoutsRes.statusText}`);
      }
      
      const workoutsData = await workoutsRes.json();
      setWorkouts(workoutsData.workouts || []);
      
      // Set role flags
      const userRoles = session?.user?.roles || [];
      const isAdminUser = userRoles.includes('admin');
      const isCoachUser = userRoles.includes('coach') || isAdminUser;
      const isCustomerUser = userRoles.includes('customer');
      
      setIsCoach(isCoachUser);
      setIsCustomer(isCustomerUser);
      setIsAdmin(isAdminUser);
      
      // For customers, get their workout count to show the limit
      if (isCustomerUser && !isAdminUser && !isCoachUser) {
        const countRes = await fetch('/api/workout?count=user', { signal });
        if (countRes.ok) {
          const countData = await countRes.json();
          const count = countData.count || 0;
          setUserWorkoutCount(count);
          setWorkoutLimitReached(count >= 3);
          setHasPermissionToCreate(count < 3);
        } else {
          throw new Error(`Error fetching workout count: ${countRes.status} ${countRes.statusText}`);
        }
      } else {
        setHasPermissionToCreate(true);
      }
      
      setError(null);
      
      controller.abort();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to load workouts. Please try again later.');
      }
      setWorkouts([]);
    } finally {
      setIsDataLoading(false);
    }
  }, [session]);
  
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);
  
  // Prefetch workout routes
  useEffect(() => {
    if (workouts.length > 0) {
      workouts.forEach(workout => {
        router.prefetch(`/workout/${workout.id}`);
      });
    }
  }, [workouts, router]);
  
  if (!session) {
    return <PageLoading label="Checking authentication..." />;
  }
  
  return (
    <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
      <div className="container mx-auto px-4">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <Suspense fallback={<PageLoading label="Cargando rutinas..." />}>
          {isDataLoading ? (
            <PageLoading label="Cargando rutinas..." />
          ) : (
            <WorkoutContent 
              workouts={workouts}
              isCoach={isCoach}
              isAdmin={isAdmin}
              isCustomer={isCustomer}
              hasPermissionToCreate={hasPermissionToCreate}
              userWorkoutCount={userWorkoutCount}
              workoutLimitReached={workoutLimitReached}
              onRefresh={fetchData}
            />
          )}
        </Suspense>
      </div>
    </main>
  );
} 