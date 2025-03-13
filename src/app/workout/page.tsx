'use client';

import { useEffect, useState } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import WorkoutHeaderWrapper from '@/components/workout/WorkoutHeaderWrapper';
import WorkoutList from '@/components/workout/WorkoutList';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Loading } from '@/components/ui/loading';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Separate component for the workout content to enable better code splitting
function WorkoutContent({ 
  workouts, 
  isCoach, 
  hasPermissionToCreate, 
  isCustomer, 
  isAdmin, 
  userWorkoutCount, 
  workoutLimitReached,
  onRefresh
}: { 
  workouts: any[]; 
  isCoach: boolean; 
  hasPermissionToCreate: boolean; 
  isCustomer: boolean; 
  isAdmin: boolean; 
  userWorkoutCount: number; 
  workoutLimitReached: boolean;
  onRefresh: () => void;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
    toast.success('Lista de rutinas actualizada');
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <WorkoutHeaderWrapper 
          title="Rutinas" 
          hasPermission={!workoutLimitReached}
          workoutCount={isCustomer ? userWorkoutCount : undefined}
          workoutLimit={isCustomer && !isCoach && !isAdmin ? 3 : undefined}
        />
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Refrescar rutinas"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </div>
      
      <WorkoutList workouts={workouts} isCoach={isCoach} />
      
      {workoutLimitReached && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">
            Has alcanzado el límite de 3 rutinas personales. Para crear más, contacta con un entrenador.
          </p>
        </div>
      )}
    </>
  );
}

export default function WorkoutPage() {
  // Use our custom hook to handle authentication
  const { session, isLoading } = useAuthRedirect({
    redirectTo: '/auth/signin?callbackUrl=/workout',
    redirectIfAuthenticated: false
  });
  
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isCoach, setIsCoach] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasPermissionToCreate, setHasPermissionToCreate] = useState(false);
  const [userWorkoutCount, setUserWorkoutCount] = useState(0);
  const [workoutLimitReached, setWorkoutLimitReached] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsDataLoading(true);
      
      // Fetch workouts with cache-busting parameter
      const timestamp = new Date().getTime();
      const workoutsRes = await fetch(`/api/workout?t=${timestamp}`);
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
        const countRes = await fetch('/api/workout?count=user');
        const countData = await countRes.json();
        const count = countData.count || 0;
        setUserWorkoutCount(count);
        setWorkoutLimitReached(count >= 3);
        
        // Only restrict permission if they've reached the limit
        setHasPermissionToCreate(count < 3);
      } else {
        // Admin and coach users always have permission to create workouts
        setHasPermissionToCreate(true);
      }
    } catch (error) {
      console.error('Error fetching workout data:', error);
      toast.error('Error al cargar las rutinas');
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data when we have a session
    if (!session) return;
    
    // Fetch data when component mounts and session is available
    fetchData();
  }, [session]);

  if (isLoading || isDataLoading) {
    return (
      <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[60vh]">
          <Loading size={32} className="text-blue-600 dark:text-blue-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loading size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
        }>
          <WorkoutContent 
            workouts={workouts} 
            isCoach={isCoach} 
            hasPermissionToCreate={hasPermissionToCreate} 
            isCustomer={isCustomer} 
            isAdmin={isAdmin} 
            userWorkoutCount={userWorkoutCount} 
            workoutLimitReached={workoutLimitReached}
            onRefresh={fetchData}
          />
        </Suspense>
      </div>
    </main>
  );
} 