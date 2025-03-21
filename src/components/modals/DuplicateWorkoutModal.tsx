'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Workout } from '@/types/models';
import { useWorkoutLimitStore } from '@/store/workoutLimitStore';
import { useSession } from 'next-auth/react';

interface DuplicateWorkoutModalProps {
  workout: Workout;
  onConfirm: (newName: string, newDescription?: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export default function DuplicateWorkoutModal({
  workout,
  onConfirm,
  onClose,
  loading = false
}: DuplicateWorkoutModalProps) {
  const { data: session } = useSession();
  
  // Get data directly from the enhanced store which includes blocker functionality
  const { 
    isBlocked,
    isCoachOrAdmin,
    formattedMaxAllowed: maxAllowed,
    isLoading,
    saveRoleToLocalStorage
  } = useWorkoutLimitStore();

  // Add defensive checks for workout properties
  const workoutName = workout?.name || 'Rutina';
  const workoutDescription = workout?.description || '';
  
  const [newName, setNewName] = useState(`${workoutName} (Copia)`);
  const [newDescription, setNewDescription] = useState(workoutDescription);
  const [error, setError] = useState<string | null>(null);
  
  // Save user roles to localStorage when session changes
  useEffect(() => {
    if (session?.user?.roles) {
      saveRoleToLocalStorage(session.user.roles);
    }
  }, [session?.user?.roles, saveRoleToLocalStorage]);
  
  // Debug log of values
  console.log('DuplicateWorkoutModal values:', {
    isCoachOrAdmin,
    maxAllowed,
    isBlocked,
    isLoading,
    sessionRoles: session?.user?.roles
  });
  
  // Immediately close the modal if user has hit their limit
  // This is a safety check in case the modal is somehow opened despite limits
  useEffect(() => {
    if (!isCoachOrAdmin && !isLoading && isBlocked) {
      const displayLimit = maxAllowed === Infinity ? 'máximo' : maxAllowed;
      toast.error(`Has alcanzado el límite de ${displayLimit} rutinas personales. Para crear más, contacta con un entrenador.`);
      onClose();
    }
  }, [isCoachOrAdmin, isLoading, isBlocked, maxAllowed, onClose]);

  // Reset form when workout changes
  useEffect(() => {
    if (workout) {
      setNewName(`${workout.name || 'Rutina'} (Copia)`);
      setNewDescription(workout.description || '');
      setError(null);
    }
  }, [workout]);

  const handleDuplicate = async () => {
    if (!newName.trim()) {
      setError('El nombre es requerido');
      return;
    }

    // Check if the user can create more workouts
    if (!isCoachOrAdmin && !isLoading && isBlocked) {
      const displayLimit = maxAllowed === Infinity ? 'máximo' : maxAllowed;
      setError(`Has alcanzado el límite de ${displayLimit} rutinas personales. Para crear más, contacta con un entrenador.`);
      return;
    }

    try {
      setError(null);
      await onConfirm(newName.trim(), newDescription.trim() || undefined);
    } catch (error) {
      console.error('Error al duplicar la rutina:', error);
      setError(error instanceof Error ? error.message : 'Error al duplicar la rutina');
      toast.error('Error al duplicar la rutina');
    }
  };

  // Determine if the duplicate button should be disabled
  const isDuplicateDisabled = loading || (!isCoachOrAdmin && !isLoading && isBlocked);
  const duplicateButtonText = loading 
    ? 'Duplicando...' 
    : (!isCoachOrAdmin && !isLoading && isBlocked)
      ? `Límite de ${maxAllowed === Infinity ? 'rutinas' : maxAllowed} alcanzado`
      : 'Duplicar';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Duplicar Rutina
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={isDuplicateDisabled}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2 ${
              isDuplicateDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
            }`}
          >
            {duplicateButtonText}
          </button>
        </div>
      </div>
    </div>
  );
} 