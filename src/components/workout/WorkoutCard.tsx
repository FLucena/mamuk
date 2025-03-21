'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Workout, WorkoutDay } from '@/types/models';
import DeleteWorkoutModal from '@/components/modals/DeleteWorkoutModal';
import { Card, CardContent } from "@/components/ui/card";
import { formatCreatedAt } from '@/lib/utils/dates';

interface WorkoutCardProps {
  id: string;
  name: string;
  description?: string;
  days: WorkoutDay[];
  onArchive: (id: string) => Promise<void>;
}

export default function WorkoutCard({ id, name, description, days, onArchive }: WorkoutCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onArchive(id);
    } catch (error) {
      console.error("Error archiving workout:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Create a workout object from the provided props
  const workoutData: Workout = {
    id,
    name,
    description: description || "",
    days,
    createdAt: new Date(id).toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "", // This might need to be populated correctly based on your data structure
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <Link href={`/workout/${id}`}>
        <Card className="cursor-pointer hover:shadow-md transition-shadow relative group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold mb-1">{name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Rutina creada el {formatCreatedAt(new Date(id))}
                </p>
                {description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
                )}
              </div>
              <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                {Array.isArray(days) ? days.length : 0} {Array.isArray(days) ? days.length === 1 ? 'día' : 'días' : ''}
              </div>
            </div>
            <button
              onClick={handleDeleteClick}
              className="absolute top-2 right-2 p-2 rounded-full bg-red-100 text-red-700 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label="Eliminar rutina"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      </Link>

      {isDeleteModalOpen && (
        <DeleteWorkoutModal
          workout={workoutData}
          onConfirm={handleDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          loading={isDeleting}
        />
      )}
    </>
  );
} 