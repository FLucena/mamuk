'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DuplicateWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  workoutName: string;
  onDuplicate: (newName: string, workoutId: string) => Promise<any>;
}

export default function DuplicateWorkoutModal({
  isOpen,
  onClose,
  workoutId,
  workoutName,
  onDuplicate
}: DuplicateWorkoutModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState(`${workoutName} (Copia)`);
  const [error, setError] = useState<string | null>(null);

  // Reiniciar el nombre cuando cambia la rutina seleccionada
  useEffect(() => {
    if (isOpen) {
      setNewName(`${workoutName} (Copia)`);
      setError('');
    }
  }, [isOpen, workoutName]);

  async function handleDuplicate() {
    setLoading(true);
    setError('');
    
    try {
      if (!newName.trim()) {
        setError('Por favor, ingresa un nombre para la rutina');
        setLoading(false);
        return;
      }
      
      if (!workoutId) {
        console.error('Error: workoutId no definido en DuplicateWorkoutModal', { workoutId });
        setError('ID de rutina no definido');
        setLoading(false);
        return;
      }
      
      await onDuplicate(newName.trim(), workoutId);
      onClose();
    } catch (error) {
      console.error('Error al duplicar la rutina:', error);
      setError(error instanceof Error ? error.message : 'Error al duplicar la rutina');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  // Validación al renderizar
  if (!workoutId && isOpen) {
    console.error('Renderizando modal sin workoutId válido');
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Duplicar Rutina
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
            Vas a duplicar la rutina "{workoutName}".
            {!workoutId && (
              <span className="text-red-500 font-bold"> ¡Atención! ID no disponible</span>
            )}
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la nueva rutina
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={loading}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              placeholder="Ingresa un nombre para la rutina"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
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
              onClick={handleDuplicate}
              disabled={loading || !newName.trim() || !workoutId}
              className="px-4 py-2 text-sm text-white bg-indigo-600 dark:bg-indigo-700 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Duplicando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Duplicar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 