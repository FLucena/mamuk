'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ErrorPage } from '@/components/ui/error';

export default function WorkoutDetailError({
  error
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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

      <ErrorPage
        title="Error al cargar la rutina"
        message={error.message || 'Ha ocurrido un error al cargar la rutina'}
      />
    </div>
  );
} 