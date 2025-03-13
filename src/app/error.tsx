/**
 * Error Boundary Component
 * 
 * This is a special Next.js file that automatically creates an error UI
 * It will be shown when an error occurs in a route segment
 * 
 * See: https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Algo salió mal
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
} 