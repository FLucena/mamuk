'use client';

export default function AdminLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-blue-600 dark:border-blue-400"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
        Cargando panel de administración...
      </p>
    </div>
  );
} 