'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface RenameWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  currentName: string;
  currentDescription?: string;
  onRename: (workoutId: string, newName: string, newDescription: string) => Promise<any>;
}

export default function RenameWorkoutModal({
  isOpen,
  onClose,
  workoutId,
  currentName,
  currentDescription = '',
  onRename
}: RenameWorkoutModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [newDescription, setNewDescription] = useState(currentDescription);
  const [error, setError] = useState<string | null>(null);

  // Reiniciar los valores cuando cambia la rutina seleccionada
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setNewDescription(currentDescription);
      setError(null);
    }
  }, [isOpen, currentName, currentDescription]);

  async function handleRename() {
    if (!newName.trim()) {
      setError('Por favor, ingresa un nombre para la rutina');
      return;
    }

    if (newName.trim() === currentName && newDescription.trim() === currentDescription) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onRename(workoutId, newName.trim(), newDescription.trim());
      toast.success('Rutina actualizada correctamente');
      
      // Refresh the page data
      router.refresh();
      
      // Add a small delay before closing the modal to ensure the data is refreshed
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error al actualizar la rutina:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar la rutina');
      toast.error('Error al actualizar la rutina');
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
            Editar Rutina
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={loading}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Nombre de la rutina"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              disabled={loading}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px]"
              placeholder="Descripción de la rutina (opcional)"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleRename}
              disabled={loading || !newName.trim() || (newName.trim() === currentName && newDescription.trim() === currentDescription)}
              className="px-4 py-2 text-sm text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 