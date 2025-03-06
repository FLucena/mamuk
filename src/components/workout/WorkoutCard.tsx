'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DiaRutina } from '@/types/models';
import DeleteWorkoutModal from './DeleteWorkoutModal';

interface WorkoutCardProps {
  id: string;
  name: string;
  description?: string;
  days: DiaRutina[];
  onArchive: (id: string) => Promise<void>;
}

export default function WorkoutCard({ id, name, description, days, onArchive }: WorkoutCardProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking on buttons, don't navigate
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/workout/${id}`);
  };

  const handleDelete = async () => {
    await onArchive(id);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-gray-700/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
        )}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {Array.isArray(days) ? days.length : 0} días · {Array.isArray(days) ? days.reduce(
            (total: number, day: DiaRutina) => total + (Array.isArray(day.blocks) ? day.blocks.length : 0),
            0
          ) : 0} bloques
        </div>
      </div>

      <DeleteWorkoutModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        workoutName={name}
      />
    </>
  );
} 