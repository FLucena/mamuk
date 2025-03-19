'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface WorkoutDetailHeaderProps {
  name: string;
  description?: string;
}

export default function WorkoutDetailHeader({ name, description }: WorkoutDetailHeaderProps) {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/workout"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-md shadow-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a rutinas
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{name}</h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
} 