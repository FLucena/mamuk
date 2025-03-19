'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ErrorPage } from '@/components/ui/error';

export default function WorkoutError({
  error
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mis rutinas
        </h1>
        <Link
          href="/workout/new"
          className="inline-flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nueva rutina
        </Link>
      </div>

      <ErrorPage
        title="Error al cargar las rutinas"
        message={error.message || 'Ha ocurrido un error al cargar las rutinas'}
      />
    </div>
  );
} 