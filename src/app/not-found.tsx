/**
 * Not Found Component
 * 
 * This is a special Next.js file that automatically creates a not-found UI
 * It will be shown when a route is not found or when notFound() is thrown
 * 
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Página no encontrada
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
} 