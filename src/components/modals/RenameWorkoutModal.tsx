'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Workout } from '@/types/models';

interface RenameWorkoutModalProps {
  workout: Workout;
  onConfirm: (newName: string, newDescription?: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export default function RenameWorkoutModal({
  workout,
  onConfirm,
  onClose,
  loading = false
}: RenameWorkoutModalProps) {
  const [newName, setNewName] = useState(workout.name);
  const [newDescription, setNewDescription] = useState(workout.description || '');
  const [error, setError] = useState<string | null>(null);

  // Reset form when workout changes
  useEffect(() => {
    setNewName(workout.name);
    setNewDescription(workout.description || '');
    setError(null);
  }, [workout]);

  async function handleRename() {
    if (!newName.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (newName.trim() === workout.name && newDescription.trim() === (workout.description || '')) {
      onClose();
      return;
    }

    try {
      setError(null);
      await onConfirm(newName.trim(), newDescription.trim() || undefined);
      toast.success('Rutina actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar la rutina:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar la rutina');
      toast.error('Error al actualizar la rutina');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Editar Rutina
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Nombre de la rutina"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Descripción de la rutina"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleRename}
            disabled={loading || !newName.trim() || (newName.trim() === workout.name && newDescription.trim() === (workout.description || ''))}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 