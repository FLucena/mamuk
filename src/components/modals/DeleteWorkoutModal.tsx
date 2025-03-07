'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface DeleteWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  workoutName: string;
  onDelete: (workoutId: string) => Promise<void>;
}

export default function DeleteWorkoutModal({
  isOpen,
  onClose,
  workoutId,
  workoutName,
  onDelete
}: DeleteWorkoutModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!workoutId) {
      setError('ID de rutina no válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onDelete(workoutId);
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error al eliminar la rutina:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar la rutina');
      toast.error('Error al eliminar la rutina');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Eliminar Rutina
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            ¿Estás seguro de que deseas eliminar la rutina <span className="font-semibold">"{workoutName}"</span>? Esta acción no se puede deshacer.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-red-600 dark:bg-red-700 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 