'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutLimitStore } from '@/store/workoutLimitStore';
import { PlusCircle } from 'lucide-react';

interface WorkoutCreationBlockerProps {
  buttonText?: string;
  className?: string;
}

/**
 * Smart button for workout creation that blocks creation when limit is reached
 * Use this component wherever you offer workout creation functionality
 */
export default function WorkoutCreationBlocker({ 
  buttonText = "Nueva Rutina", 
  className = "" 
}: WorkoutCreationBlockerProps) {
  const router = useRouter();
  
  // Use the enhanced Zustand store directly
  const { 
    isBlocked, 
    isCoachOrAdmin, 
    checkAndBlockAction, 
    formattedMaxAllowed 
  } = useWorkoutLimitStore();
  
  const handleCreateClick = useCallback((e: React.MouseEvent) => {
    // If blocked, show message and prevent navigation
    if (checkAndBlockAction(e)) {
      return;
    }
    
    // Otherwise navigate to workout creation page
    router.push('/workout/create');
  }, [router, checkAndBlockAction]);
  
  // Determine button appearance based on limits
  const buttonColorClasses = isBlocked && !isCoachOrAdmin
    ? "bg-gray-300 text-gray-600 hover:bg-gray-300 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
    : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600";
  
  // Format the display text for maxAllowed
  const displayLimit = formattedMaxAllowed === Infinity ? 'máximo' : formattedMaxAllowed;
  
  const title = isBlocked && !isCoachOrAdmin
    ? `Has alcanzado el límite de ${displayLimit} rutinas personales. Para crear más, contacta con un entrenador.`
    : "Crear una nueva rutina personalizada";
  
  return (
    <button
      type="button"
      onClick={handleCreateClick}
      disabled={isBlocked && !isCoachOrAdmin}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${buttonColorClasses} ${className}`}
      aria-label={title}
      title={title}
    >
      <PlusCircle className="w-5 h-5 mr-2" />
      {buttonText}
    </button>
  );
} 