'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface WorkoutDetailHeaderProps {
  name: string;
  description?: string;
}

export default function WorkoutDetailHeader({ name, description }: WorkoutDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <Link
        href="/workout"
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver a rutinas
      </Link>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{name}</h1>
        {description && (
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
} 