'use client';

import React, { useState, useEffect, Suspense, memo, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLightSession } from '@/hooks/useOptimizedSession';
import { Workout, WorkoutDay, Block, Exercise } from '@/types/models';

// Import only the specific icons we need instead of the whole library
import { RefreshCw, AlertCircle } from 'lucide-react';

// Dynamically import components with reduced loading states
const PageLoading = dynamic(() => import('@/components/ui/PageLoading'), {
  loading: () => <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>,
  ssr: false
});

const WorkoutHeaderWrapper = dynamic(() => import('@/components/workout/WorkoutHeaderWrapper'), {
  loading: () => <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
});

// Use more aggressive code splitting for the WorkoutList component
const WorkoutList = dynamic(() => import('@/components/workout/WorkoutList'), {
  loading: () => <div className="space-y-4">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    ))}
  </div>,
  ssr: false // Disable SSR for this component to reduce server load
});

// Update WorkoutContentProps interface
interface WorkoutContentProps {
  workouts: Workout[];
  isCoach: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
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
    } catch {
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
    <div className="space-y-4">
      
      {/* Header with create button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        {headerComponent}
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          aria-label="Refrescar rutinas"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </div>
      
      <WorkoutList 
        workouts={workouts} 
        isCoach={isCoach || isAdmin} 
        workoutLimitReached={workoutLimitReached} 
      />
      
      {workoutLimitReached && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">
            Has alcanzado el límite de 3 rutinas personales. Para crear más, contacta con un entrenador.
          </p>
        </div>
      )}
    </div>
  );
});

export default function WorkoutPage() {
  const { data: session } = useLightSession();
  const router = useRouter();
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isCoach, setIsCoach] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userWorkoutCount, setUserWorkoutCount] = useState(0);
  const [workoutLimitReached, setWorkoutLimitReached] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      
      const controller = new AbortController();
      const signal = controller.signal;
      
      // Add timestamp query param to prevent caching
      const workoutsRes = await fetch(`/api/workout?t=${Date.now()}`, {
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
      
      // Transform API response to match the expected Workout type
      const transformedWorkouts: Workout[] = (workoutsData.workouts || []).map((workout: any) => ({
        _id: workout._id || workout.id || '',
        id: workout.id || workout._id || '',
        name: workout.name || '',
        description: workout.description || '',
        days: (workout.days || []).map((day: any) => ({
          _id: day._id || day.id || '',
          id: day.id || day._id || '',
          name: day.name || '',
          blocks: (day.blocks || []).map((block: any) => ({
            _id: block._id || block.id || '',
            id: block.id || block._id || '',
            name: block.name || '',
            exercises: (block.exercises || []).map((exercise: any) => ({
              _id: exercise._id || exercise.id || '',
              id: exercise.id || exercise._id || '',
              name: exercise.name || '',
              sets: exercise.sets || 0,
              reps: exercise.reps || 0,
              weight: exercise.weight || 0,
              notes: exercise.notes || '',
              videoUrl: exercise.videoUrl || ''
            }))
          }))
        })),
        userId: workout.userId || '',
        createdBy: workout.createdBy || workout.userId || '',
        createdAt: workout.createdAt || new Date().toISOString(),
        updatedAt: workout.updatedAt || new Date().toISOString()
      }));
      
      setWorkouts(transformedWorkouts);
      
      // Set role flags
      const userRoles = session?.user?.roles || [];
      const isAdminUser = userRoles.includes('admin');
      const isCoachUser = userRoles.includes('coach') || isAdminUser;
      const isCustomerUser = userRoles.includes('customer') && !isCoachUser;
      
      setIsAdmin(isAdminUser);
      setIsCoach(isCoachUser);
      setIsCustomer(isCustomerUser);

      // Count personal workouts (created by the user themselves)
      if (isCustomerUser) {
        const personalWorkouts = transformedWorkouts.filter(
          workout => workout.createdBy === workout.userId
        );
        setUserWorkoutCount(personalWorkouts.length);
        setWorkoutLimitReached(personalWorkouts.length >= 3);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError('Error al cargar las rutinas');
      toast.error('Error al cargar las rutinas');
    } finally {
      setIsDataLoading(false);
    }
  }, [session?.user?.roles]);
  
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);
  
  // Use a more efficient prefetching strategy
  useEffect(() => {
    if (workouts.length > 0) {
      // Only prefetch the first 3 workouts to reduce network load
      const workoutsToPrefetch = workouts.slice(0, 3);
      workoutsToPrefetch.forEach(workout => {
        if (workout.id) {
          router.prefetch(`/workout/${workout.id}`);
        }
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