'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Workout } from '@/types/models';

interface DeleteWorkoutModalProps {
  workout: Workout;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export default function DeleteWorkoutModal({
  workout,
  onConfirm,
  onClose,
  loading = false
}: DeleteWorkoutModalProps) {
  const [error, setError] = useState<string | null>(null);

  // Ensure workout is valid
  if (!workout) {
    console.error('DeleteWorkoutModal: workout prop is missing');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-4">
          <p className="text-red-600">Error: Unable to load workout details.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 text-sm font-medium bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!onConfirm) {
      console.error('DeleteWorkoutModal: onConfirm function is missing');
      setError('Error: Unable to delete workout. Missing confirmation handler.');
      return;
    }

    try {
      setError(null);
      await onConfirm();
    } catch (error) {
      console.error('Error al eliminar la rutina:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar la rutina');
      toast.error('Error al eliminar la rutina');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Eliminar Rutina
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-300">
            ¿Estás seguro de que quieres eliminar la rutina <strong>{workout?.name || 'Sin nombre'}</strong>? Esta acción no se puede deshacer.
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
} 