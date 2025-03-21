'use client';

import { useState, useCallback, useMemo, memo, lazy, Suspense, useEffect, Component, ErrorInfo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Copy, Users, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import RenderTracker from '../RenderTracker';
import { duplicateWorkout, assignWorkoutToUser, updateWorkoutName, deleteWorkout } from '@/app/workout/[id]/actions';
import { Workout, Block, Exercise, WorkoutDay } from '@/types/models';
import { useWorkoutLimit } from '@/hooks/useWorkoutLimit';
import { useWorkoutBlocker } from '@/utils/workoutBlocker';

// Lazy load modals to reduce initial JS bundle size
const DuplicateWorkoutModal = lazy(() => 
  import('../modals/DuplicateWorkoutModal')
    .catch(err => {
      console.error('Error loading DuplicateWorkoutModal:', err);
      // Return a fallback component
      return { default: () => <div>Error loading modal</div> };
    })
);

const AssignWorkoutModal = lazy(() => 
  import('../modals/AssignWorkoutModal')
    .catch(err => {
      console.error('Error loading AssignWorkoutModal:', err);
      return { default: () => <div>Error loading modal</div> };
    })
);

const RenameWorkoutModal = lazy(() => 
  import('../modals/RenameWorkoutModal')
    .catch(err => {
      console.error('Error loading RenameWorkoutModal:', err);
      return { default: () => <div>Error loading modal</div> };
    })
);

const DeleteWorkoutModal = lazy(() => 
  import('@/components/modals/DeleteWorkoutModal')
    .catch(err => {
      console.error('Error loading DeleteWorkoutModal:', err);
      return { default: () => <div>Error loading modal</div> };
    })
);

interface WorkoutListProps {
  workouts: Workout[];
  isCoach?: boolean;
  workoutLimitReached?: boolean;
}

// Loading skeleton component for better perceived performance
const WorkoutCardSkeleton = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm animate-pulse">
    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
      </div>
      <div className="flex gap-2 mt-3 md:mt-0">
        <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
);

// Cache state helper to improve bfcache compatibility
const useBFCacheRestoration = (onRestore: () => void) => {
  useEffect(() => {
    // When page is restored from bfcache
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Page was restored from bfcache
        onRestore();
      }
    };

    // Add event listeners for page transitions
    window.addEventListener('pageshow', handlePageShow);
    
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [onRestore]);
};

// Separate WorkoutCard component to reduce re-renders of the main list
const WorkoutCard = memo(function WorkoutCard({
  workout,
  workoutId,
  isCoach,
  onView,
  onEdit,
  onDuplicate,
  onAssign,
  onDelete,
  index,
  workoutLimitReached
}: {
  workout: Workout;
  workoutId: string | null;
  isCoach: boolean;
  onView: (id: string) => void;
  onEdit: (workout: Workout) => void;
  onDuplicate: (workout: Workout) => void;
  onAssign: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  index: number;
  workoutLimitReached?: boolean;
}) {
  const { isBlocked, isCoachOrAdmin, maxAllowed } = useWorkoutBlocker();
  
  // Use both the props and the Zustand store for determining if duplicate is disabled
  const isDuplicateDisabled = (!isCoachOrAdmin && isBlocked) || (!isCoach && workoutLimitReached);
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm will-change-transform">
      {/* Debug banner */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-2 p-1 text-xs bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 rounded border border-pink-300 dark:border-pink-800">
          <p className="font-semibold">🔍 Card Debug:</p>
          <p>isDuplicateDisabled: {String(isDuplicateDisabled)}</p>
          <p>isCoach: {String(isCoach)}</p>
          <p>isCoachOrAdmin: {String(isCoachOrAdmin)}</p>
          <p>isBlocked: {String(isBlocked)}</p>
          <p>workoutLimitReached: {String(workoutLimitReached)}</p>
          <p>From hook - maxAllowed: {maxAllowed}</p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {workout.name}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {workout.days?.length || 0} {workout.days?.length === 1 ? 'día' : 'días'}
          </p>
          
          {workout.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {workout.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
          {workoutId && (
            <button
              onClick={() => onView(workoutId)}
              className="inline-flex items-center justify-center p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label={`Ver rutina ${workout.name}`}
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => onEdit(workout)}
            className="inline-flex items-center justify-center p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label={`Editar rutina ${workout.name}`}
            data-testid="edit-workout-button"
          >
            <Edit className="w-5 h-5" />
          </button>
          
          <button
            onClick={(e) => {
              // The blocking logic is now centralized in handleDuplicateClick
              // so we don't need to repeat it here
              onDuplicate(workout);
            }}
            className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isDuplicateDisabled
                ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 cursor-pointer'
            }`}
            aria-label={isDuplicateDisabled 
              ? `Has alcanzado el límite de ${maxAllowed} rutinas personales`
              : `Duplicar rutina ${workout.name}`}
            title={isDuplicateDisabled 
              ? `Has alcanzado el límite de ${maxAllowed} rutinas personales`
              : `Duplicar rutina ${workout.name}`}
            disabled={isDuplicateDisabled}
            data-disabled={isDuplicateDisabled}
            data-blocked={isBlocked}
            data-workout-limit-reached={workoutLimitReached}
          >
            <Copy className="w-5 h-5" />
          </button>
          
          {isCoach && (
            <button
              onClick={() => onAssign(workout)}
              className="inline-flex items-center justify-center p-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label={`Asignar rutina ${workout.name}`}
            >
              <Users className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(workout)}
            className="inline-flex items-center justify-center p-2 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            aria-label={`Eliminar rutina ${workout.name}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

// Custom equality function for memo to prevent unnecessary re-renders
function arePropsEqual(prevProps: WorkoutListProps, nextProps: WorkoutListProps) {
  // Check if isCoach changed
  if (prevProps.isCoach !== nextProps.isCoach) return false;
  
  // Check if workouts array length changed
  if (prevProps.workouts.length !== nextProps.workouts.length) return false;
  
  // Check if any workout IDs changed (shallow comparison of IDs only)
  for (let i = 0; i < prevProps.workouts.length; i++) {
    const prevId = prevProps.workouts[i].id;
    const nextId = nextProps.workouts[i].id;
    if (prevId !== nextId) return false;
  }
  
  // If we got here, props are considered equal
  return true;
}

// Custom error boundary component
class ModalErrorBoundary extends Component<
  { children: React.ReactNode, fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Modal error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md mt-4">
          Ocurrió un error al cargar este componente. Por favor, intenta de nuevo.
        </div>
      );
    }

    return this.props.children;
  }
}

// Main component - memoized to prevent unnecessary re-renders
const WorkoutList = memo(function WorkoutList({ 
  workouts: initialWorkouts, 
  isCoach = false,
  workoutLimitReached = false // Single source of truth for determining if workout limits are reached
}: WorkoutListProps) {
  const router = useRouter();
  
  const { isBlocked, maxAllowed, currentCount, isLoading: isLimitLoading, blockAction } = useWorkoutBlocker();
  
  const effectiveWorkoutLimitReached = isCoach ? false : (workoutLimitReached || isBlocked);
  
  console.warn('⚠️ MAIN COMPONENT LIMITS - currentCount:', currentCount, 'maxAllowed:', maxAllowed, 'isCoach:', isCoach, 'isBlocked:', isBlocked);
  
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Callback for bfcache restoration
  const handleCacheRestore = useCallback(() => {
    // Refresh data when restored from bfcache
    router.refresh();
  }, [router]);

  // Use bfcache restoration helper
  useBFCacheRestoration(handleCacheRestore);

  // Fix the useCallback implementation for loading state
  useEffect(() => {
    if (initialWorkouts.length > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [initialWorkouts]);

  // Handle page visibility changes to manage WebSocket connections
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is being hidden, potentially for bfcache
        // Close any WebSocket connections or clean up resources here
        document.dispatchEvent(new CustomEvent('mamuk:suspend-connections'));
      } else if (document.visibilityState === 'visible') {
        // Page is visible again, potentially restored from bfcache
        // Restore connections if needed
        document.dispatchEvent(new CustomEvent('mamuk:resume-connections'));
      }
    };

    // Handle page transitions
    const handlePageHide = () => {
      // Close any active connections when page is about to be unloaded or put in bfcache
      document.dispatchEvent(new CustomEvent('mamuk:suspend-connections'));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  // Memoize the workouts array to prevent unnecessary re-renders
  const workouts = useMemo(() => initialWorkouts, [initialWorkouts]);

  // Use useCallback for all functions including utility functions
  const getValidWorkoutId = useCallback((workout: Workout): string | null => {
    if (workout.id && typeof workout.id === 'string' && workout.id.length > 0) {
      return workout.id;
    }
    return null;
  }, []);

  // Navigation callback
  const handleWorkoutClick = useCallback((workoutId: string) => {
    if (!workoutId) {
      console.error('Invalid workout ID');
      toast.error('No se puede acceder a esta rutina');
      return;
    }
    router.push(`/workout/${workoutId}`);
  }, [router]);

  const handleDuplicateClick = useCallback((workout: Workout) => {
    console.log('handleDuplicateClick', {
      workoutLimitReached,
      isBlocked,
      isCoach,
      maxAllowed
    });
    if ((workoutLimitReached || isBlocked) && !isCoach) {
      // Show error message but don't open modal
      toast.error(`Has alcanzado el límite de ${maxAllowed} rutinas personales. Para crear más, contacta con un entrenador.`);
      blockAction();
      return;
    }
    
    // Only set the selected workout and show modal if user can create more workouts
    setSelectedWorkout(workout);
    setShowDuplicateModal(true);
  }, [isCoach, workoutLimitReached, isBlocked, blockAction]);

  const handleDuplicate = useCallback(async (newName: string, newDescription?: string) => {
    if (!selectedWorkout) return;

    const workoutId = getValidWorkoutId(selectedWorkout);
    if (!workoutId || !newName) {
      setError('ID de rutina o nuevo nombre no definido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const duplicated = await duplicateWorkout(workoutId, newName, newDescription || '');
      
      if (!duplicated || !duplicated.id) {
        throw new Error('La respuesta del servidor no incluye información válida de la rutina');
      }
      
      setShowDuplicateModal(false);
      toast.success('Rutina duplicada exitosamente');
      
      // Add a longer delay and keep loading state until refresh is complete
      setTimeout(() => {
        router.refresh();
        // Only remove loading state after refresh
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }, 800);
    } catch (error) {
      setError('Error al duplicar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al duplicar la rutina');
      setLoading(false);
    }
  }, [selectedWorkout, getValidWorkoutId, router]);

  const handleAssignClick = useCallback((workout: Workout) => {
    setSelectedWorkout(workout);
    setShowAssignModal(true);
  }, []);

  const handleAssign = useCallback(async (data: { coachIds: string[]; customerIds: string[] }) => {
    if (!selectedWorkout) return;

    const workoutId = getValidWorkoutId(selectedWorkout);
    if (!workoutId) {
      toast.error('No se puede asignar esta rutina: ID inválido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await assignWorkoutToUser(workoutId, data);
      
      setShowAssignModal(false);
      toast.success('Rutina asignada exitosamente');
      
      // Add a longer delay and keep loading state until refresh is complete
      setTimeout(() => {
        router.refresh();
        // Only remove loading state after refresh
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }, 800);
    } catch (error) {
      setError('Error al asignar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al asignar la rutina');
      setLoading(false);
    }
  }, [selectedWorkout, getValidWorkoutId, router]);

  const handleRenameClick = useCallback((workout: Workout) => {
    setSelectedWorkout(workout);
    setShowRenameModal(true);
  }, []);

  const handleRename = useCallback(async (newName: string, newDescription?: string) => {
    if (!selectedWorkout) return;

    const workoutId = getValidWorkoutId(selectedWorkout);
    if (!workoutId || !newName) {
      setError('ID de rutina o nuevo nombre no definido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateWorkoutName(workoutId, newName, newDescription || '');
      
      setShowRenameModal(false);
      toast.success('Rutina renombrada exitosamente');
      
      // Add a longer delay and keep loading state until refresh is complete
      setTimeout(() => {
        router.refresh();
        // Only remove loading state after refresh
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }, 800);
    } catch (error) {
      setError('Error al renombrar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al renombrar la rutina');
      setLoading(false);
    }
  }, [selectedWorkout, getValidWorkoutId, router]);

  const handleDeleteClick = useCallback((workout: Workout) => {
    setSelectedWorkout(workout);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedWorkout) {
      setError('No workout selected');
      return Promise.reject(new Error('No workout selected'));
    }

    const workoutId = getValidWorkoutId(selectedWorkout);
    if (!workoutId) {
      setError('ID de rutina no definido');
      return Promise.reject(new Error('ID de rutina no definido'));
    }

    setLoading(true);
    setError(null);

    try {
      const userId = selectedWorkout.userId || '';
      await deleteWorkout(workoutId, userId);
      
      setShowDeleteModal(false);
      toast.success('Rutina eliminada exitosamente');
      
      // Add a longer delay and keep loading state until refresh is complete
      setTimeout(() => {
        router.refresh();
        // Only remove loading state after refresh
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }, 800);
    } catch (error) {
      setError('Error al eliminar la rutina. Por favor, inténtalo de nuevo.');
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la rutina');
      setLoading(false);
    }
  }, [selectedWorkout, getValidWorkoutId, router]);

  // Memoize the empty state message
  const emptyState = useMemo(() => (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
      <p>No tienes rutinas todavía.</p>
    </div>
  ), []);

  return (
    <div className="relative space-y-4" data-testid="workout-list-container">
      {/* Debug banner */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-4 p-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded border border-blue-300 dark:border-blue-800">
          <p className="font-medium">🐛 WorkoutList Debug:</p>
          <div className="text-xs space-y-1 mt-1">
            <p>workoutLimitReached prop: {String(workoutLimitReached)}</p>
            <p>isCoach prop: {String(isCoach)}</p>
            <p>useWorkoutLimit hook values:</p>
            <p>- canCreate: {String(maxAllowed > 0)}</p>
            <p>- currentCount: {currentCount}</p>
            <p>- maxAllowed: {maxAllowed}</p>
            <p>- userRole: {String(isCoach)}</p>
            <p>- isLoading: {String(isLimitLoading)}</p>
            <p>Rendered at: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      )}
      
      {workouts.length === 0 ? emptyState : (
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            // Show skeleton loaders while loading
            Array(Math.min(workouts.length, 3)).fill(0).map((_, i) => (
              <WorkoutCardSkeleton key={i} />
            ))
          ) : (
            workouts.map((workout, index) => {
              const workoutId = getValidWorkoutId(workout);
              console.warn(`⚠️ Creating WorkoutCard for workout: ${workout.name}, index: ${index}, id: ${workoutId}`);
              
              return (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  workoutId={workoutId}
                  isCoach={isCoach}
                  onView={handleWorkoutClick}
                  onEdit={handleRenameClick}
                  onDuplicate={handleDuplicateClick}
                  onAssign={handleAssignClick}
                  onDelete={handleDeleteClick}
                  index={index}
                  workoutLimitReached={effectiveWorkoutLimitReached}
                />
              );
            })
          )}
        </div>
      )}

      {/* Lazy load modals only when needed */}
      {selectedWorkout && (
        <ModalErrorBoundary>
          <Suspense fallback={<div className="fixed inset-0 bg-black/20 flex items-center justify-center">Loading...</div>}>
            {showDuplicateModal && (
              <DuplicateWorkoutModal
                workout={selectedWorkout}
                onConfirm={handleDuplicate}
                onClose={() => setShowDuplicateModal(false)}
                loading={loading}
              />
            )}
            
            {showAssignModal && (
              <AssignWorkoutModal
                workout={selectedWorkout}
                onConfirm={handleAssign}
                onClose={() => setShowAssignModal(false)}
                loading={loading}
              />
            )}
            
            {showRenameModal && (
              <RenameWorkoutModal
                workout={selectedWorkout}
                onConfirm={handleRename}
                onClose={() => setShowRenameModal(false)}
                loading={loading}
              />
            )}
            
            {showDeleteModal && (
              <DeleteWorkoutModal
                workout={{
                  ...selectedWorkout,
                  name: selectedWorkout.name || 'Unnamed Workout'
                }}
                onConfirm={handleDelete}
                onClose={() => setShowDeleteModal(false)}
                loading={loading}
              />
            )}
          </Suspense>
        </ModalErrorBoundary>
      )}
      
      <div className="absolute top-0 right-0 m-1">
        <RenderTracker componentName="WorkoutList" showCount={process.env.NODE_ENV === 'development'} />
      </div>
    </div>
  );
}, arePropsEqual);

export default WorkoutList; 