'use client';

import LoadingLogo from '@/components/ui/LoadingLogo';

export default function AdminCoachDetailLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <LoadingLogo size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
        Cargando detalles del entrenador...
      </p>
    </div>
  );
} 