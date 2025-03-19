import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getArchivedWorkouts } from '@/lib/services/workout/getArchivedWorkouts';
import { ROLES } from '@/lib/constants/roles';
import WorkoutList from '@/components/workout/WorkoutList';

export default async function ArchivedWorkoutsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Check if user is admin
  if (!session.user.roles.includes(ROLES.ADMIN)) {
    redirect('/workout');
  }

  try {
    const workouts = await getArchivedWorkouts(session.user.id);

    return (
      <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Rutinas Archivadas</h1>
          {/* @ts-ignore - Type compatibility issues between different Workout interfaces */}
          <WorkoutList workouts={workouts} isCoach={false} />
          {workouts.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No hay rutinas archivadas. Las rutinas que se archiven aparecerán aquí para su revisión.
            </p>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading archived workouts:', error);
    return (
      <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Rutinas Archivadas</h1>
          <p className="text-red-500 dark:text-red-400 text-center py-8">
            Error al cargar las rutinas archivadas. Por favor, inténtalo de nuevo más tarde.
          </p>
        </div>
      </main>
    );
  }
} 