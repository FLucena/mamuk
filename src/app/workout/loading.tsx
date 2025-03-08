'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutLoading() {
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

      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-blue-600 dark:border-blue-400"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
          Cargando rutinas...
        </p>
      </div>
    </div>
  );
} 