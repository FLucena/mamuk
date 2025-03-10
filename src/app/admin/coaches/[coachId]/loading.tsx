'use client';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminCoachDetailLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Cargando detalles del Coach...
      </p>
    </div>
  );
} 