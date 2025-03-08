'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/workout"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a rutinas
        </Link>
      </div>
      
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-blue-600 dark:border-blue-400"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
          Cargando rutina...
        </p>
      </div>
    </div>
  );
} 