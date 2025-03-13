import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createWorkout } from '@/lib/services/workout';

export default async function NewWorkoutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Check if user has permission to create workouts
  if (!session.user.roles.some(role => ['admin', 'coach'].includes(role))) {
    redirect('/workout');
  }

  const userId = session.user.id;

  async function handleSubmit(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) {
      throw new Error('El nombre es requerido');
    }

    const workout = await createWorkout({
      name,
      description,
      days: [
        {
          id: 'dia1',
          name: 'Día 1',
          blocks: [
            {
              id: 'bloque1',
              name: 'Bloque 1',
              exercises: [],
            },
            {
              id: 'bloque2',
              name: 'Bloque 2',
              exercises: [],
            },
            {
              id: 'bloque3',
              name: 'Bloque 3',
              exercises: [],
            },
            {
              id: 'bloque4',
              name: 'Bloque 4',
              exercises: [],
            },
          ],
        },
        {
          id: 'dia2',
          name: 'Día 2',
          blocks: [
            {
              id: 'bloque5',
              name: 'Bloque 1',
              exercises: [],
            },
            {
              id: 'bloque6',
              name: 'Bloque 2',
              exercises: [],
            },
            {
              id: 'bloque7',
              name: 'Bloque 3',
              exercises: [],
            },
            {
              id: 'bloque8',
              name: 'Bloque 4',
              exercises: [],
            },
          ],
        },
        {
          id: 'dia3',
          name: 'Día 3',
          blocks: [
            {
              id: 'bloque9',
              name: 'Bloque 1',
              exercises: [],
            },
            {
              id: 'bloque10',
              name: 'Bloque 2',
              exercises: [],
            },
            {
              id: 'bloque11',
              name: 'Bloque 3',
              exercises: [],
            },
            {
              id: 'bloque12',
              name: 'Bloque 4',
              exercises: [],
            },
          ],
        },
      ],
    }, userId);

    redirect(`/workout/${workout.id}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/workout"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Nueva Rutina
          </h1>
        </div>

        <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6">
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Ej: Rutina de Volumen"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Describe el objetivo de esta rutina"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Crear Rutina
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
} 