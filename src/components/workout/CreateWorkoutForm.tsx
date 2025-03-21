'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWorkoutBlocker } from '@/utils/workoutBlocker';

interface CreateWorkoutFormProps {
  onSubmit?: (workoutId: string) => void;
  redirectOnSuccess?: boolean;
}

export default function CreateWorkoutForm({ 
  onSubmit, 
  redirectOnSuccess = true 
}: CreateWorkoutFormProps) {
  const router = useRouter();
  const [name, setName] = useState('Mi rutina personalizada');
  const [description, setDescription] = useState('Rutina de entrenamiento personalizada');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the workout blocker to check if user can create workouts
  const { isBlocked, isCoachOrAdmin, maxAllowed, refresh } = useWorkoutBlocker();
  
  // Check limits when component mounts
  useEffect(() => {
    refresh();
  }, [refresh]);
  
  // If user can't create workouts and is not a coach, show error and redirect
  useEffect(() => {
    if (isBlocked && !isCoachOrAdmin) {
      toast.error(`Has alcanzado el límite de ${maxAllowed} rutinas personales. Para crear más, contacta con un entrenador.`);
      router.push('/workout');
    }
  }, [isBlocked, isCoachOrAdmin, maxAllowed, router]);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (isBlocked && !isCoachOrAdmin) {
      setError(`Has alcanzado el límite de ${maxAllowed} rutinas personales. Para crear más, contacta con un entrenador.`);
      return;
    }
    
    if (!name.trim()) {
      setError('El nombre de la rutina es obligatorio');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: name.trim(),
          description: description.trim(),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la rutina');
      }
      
      const workout = await response.json();
      
      toast.success('Rutina creada exitosamente');
      
      if (onSubmit) {
        onSubmit(workout.id);
      }
      
      if (redirectOnSuccess) {
        router.push(`/workout/${workout.id}`);
      }
    } catch (error) {
      console.error('Error creating workout:', error);
      setError(error instanceof Error ? error.message : 'Error al crear la rutina');
      toast.error(error instanceof Error ? error.message : 'Error al crear la rutina');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isBlocked && !isCoachOrAdmin) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-200 dark:border-amber-800">
        <h2 className="text-amber-700 dark:text-amber-400 font-medium text-lg mb-2">
          Límite de rutinas alcanzado
        </h2>
        <p className="text-amber-600 dark:text-amber-300">
          Has alcanzado el límite de {maxAllowed} rutinas personales. Para crear más, contacta con un entrenador.
        </p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre de la rutina
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Creando...' : 'Crear rutina'}
        </button>
      </div>
    </form>
  );
} 