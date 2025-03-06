import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getWorkouts } from '@/lib/services/workout';
import WorkoutHeaderWrapper from '@/components/workout/WorkoutHeaderWrapper';
import WorkoutList from '@/components/workout/WorkoutList';
import { handleArchiveWorkout } from './actions';
import { getCurrentUserRole } from '@/lib/utils/permissions';

export default async function WorkoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const userId = session.user.id;
  const workouts = await getWorkouts(userId);
  
  // Determinar el rol directamente desde la base de datos
  let isCoach = session.user.role === 'coach' || session.user.role === 'admin';
  
  // Usar getCurrentUserRole para obtener el rol actualizado desde la base de datos
  if (session.user.email) {
    try {
      const currentRole = await getCurrentUserRole(session.user.email);
      
      // Actualizar isCoach basado en el rol obtenido de la base de datos
      isCoach = currentRole === 'coach' || currentRole === 'admin';
    } catch (error) {
      console.error('Error getting current user role:', error);
      // Mantener el valor anterior de isCoach si hay un error
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WorkoutHeaderWrapper title="Rutinas" />
      
      {/* @ts-ignore - Pasamos los workouts directamente al componente */}
      <WorkoutList workouts={workouts} isCoach={isCoach} />

      {workouts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No tienes rutinas creadas
          </p>
        </div>
      )}
    </div>
  );
} 