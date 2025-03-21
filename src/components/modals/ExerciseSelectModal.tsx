'use client';

import { useState, useEffect } from 'react';
import { Exercise } from '@/types/models';
import { Check, X } from 'lucide-react';

interface ExerciseSelectModalProps {
  exercises: Exercise[];
  onConfirm: (exercise: Exercise) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export default function ExerciseSelectModal({
  exercises,
  onConfirm,
  onClose,
  loading = false
}: ExerciseSelectModalProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset form when exercises change
  useEffect(() => {
    setSelectedExercise(null);
    setSearchTerm('');
    setError(null);
  }, [exercises]);

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = async () => {
    if (!selectedExercise) return;

    try {
      setError(null);
      await onConfirm(selectedExercise);
    } catch (error) {
      console.error('Error al seleccionar el ejercicio:', error);
      setError(error instanceof Error ? error.message : 'Error al seleccionar el ejercicio');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Seleccionar Ejercicio
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
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ejercicio..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                disabled={loading}
                className={`w-full text-left p-3 rounded-md mb-2 transition-colors ${
                  selectedExercise?.id === exercise.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {exercise.name}
              </button>
            ))}
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
            onClick={handleSelect}
            disabled={loading || !selectedExercise}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Seleccionando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Seleccionar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 