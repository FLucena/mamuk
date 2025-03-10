import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getWorkouts } from '@/lib/services/workout';
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import WorkoutList from '@/components/workout/WorkoutList';
import { handleArchiveWorkout, canCreateWorkouts } from './actions';
import { getCurrentUserRole } from '@/lib/utils/permissions';

export default async function WorkoutPage() {
  const session = await getServerSession(authOptions);
  
  // Only redirect if there's no session at all, not based on user ID
  if (!session) {
    redirect('/auth/signin');
  }

  // Ensure we have a user ID for fetching workouts
  const userId = session.user?.id;
  if (!userId) {
    console.error('User session exists but no user ID found');
    redirect('/auth/signin');
  }

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

  // Check if user can create workouts
  const hasPermission = await canCreateWorkouts();

  return (
    <div className="container mx-auto px-4 py-8">
      <WorkoutHeader 
        title="Rutinas" 
        hasPermission={hasPermission}
      />
      
      {/* @ts-ignore - Pasamos los workouts directamente al componente */}
      <WorkoutList workouts={workouts} isCoach={isCoach} />

      {workouts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
          </p>
        </div>
      )}
    </div>
  );
} 