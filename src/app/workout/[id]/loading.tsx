'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LoadingPage } from '@/components/ui/loading';

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
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-4 animate-pulse" />
        <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
      </div>

      <LoadingPage />
    </div>
  );
} 