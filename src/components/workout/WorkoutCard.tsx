'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Workout, WorkoutDay } from '@/types/models';
import DeleteWorkoutModal from './DeleteWorkoutModal';
import Link from 'next/link';
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
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCardClick = () => {
    if (typeof window !== 'undefined' && window.getSelection()?.toString()) {
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
      <Link href={`/workout/${id}`}>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
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
          </CardContent>
        </Card>
      </Link>

      <DeleteWorkoutModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        workoutName={name}
      />
    </>
  );
} 