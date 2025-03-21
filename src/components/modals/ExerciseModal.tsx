'use client';

import { Exercise } from '@/types/models';
import { X } from 'lucide-react';

interface ExerciseModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export default function ExerciseModal({
  exercise,
  onClose
}: ExerciseModalProps) {
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {exercise.name}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Series
            </h3>
            <p className="mt-1 text-gray-900 dark:text-white">
              {exercise.sets}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Repeticiones
            </h3>
            <p className="mt-1 text-gray-900 dark:text-white">
              {exercise.reps}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Peso
            </h3>
            <p className="mt-1 text-gray-900 dark:text-white">
              {exercise.weight} kg
            </p>
          </div>

          {exercise.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notas
              </h3>
              <p className="mt-1 text-gray-900 dark:text-white">
                {exercise.notes}
              </p>
            </div>
          )}

          {exercise.videoUrl && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Video
              </h3>
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Ver video
              </a>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
} 