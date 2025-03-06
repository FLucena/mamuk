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
  onRename: (workoutId: string, newName: string) => Promise<any>;
}

export default function RenameWorkoutModal({
  isOpen,
  onClose,
  workoutId,
  currentName,
  onRename
}: RenameWorkoutModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  // Reiniciar el nombre cuando cambia la rutina seleccionada
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError(null);
    }
  }, [isOpen, currentName]);

  async function handleRename() {
    if (!newName.trim()) {
      setError('Por favor, ingresa un nombre para la rutina');
      return;
    }

    if (newName.trim() === currentName) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onRename(workoutId, newName.trim());
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error al renombrar la rutina:', error);
      setError(error instanceof Error ? error.message : 'Error al renombrar la rutina');
      toast.error('Error al renombrar la rutina');
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
            Renombrar Rutina
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
            Introduce un nuevo nombre para la rutina "{currentName}".
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nuevo nombre
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={loading}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nombre de la rutina"
              autoFocus
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
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleRename}
              disabled={loading || !newName.trim() || newName.trim() === currentName}
              className="px-4 py-2 text-sm text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Renombrando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Renombrar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 