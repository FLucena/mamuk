'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

interface WorkoutHeaderProps {
  title: string;
  newButtonText?: string;
  hasPermission: boolean;
}

export default function WorkoutHeader({ title, newButtonText = 'Nueva rutina', hasPermission }: WorkoutHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      {hasPermission && (
        <Link
          href="/workout/new"
          className="inline-flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          {newButtonText}
        </Link>
      )}
    </div>
  );
} 