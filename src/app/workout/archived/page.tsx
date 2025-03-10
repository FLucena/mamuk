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
  if (!session.user.roles?.includes('admin')) {
    redirect('/workout');
  }

  try {
    const workouts = await getArchivedWorkouts(session.user.id);

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Rutinas Archivadas</h1>
        <WorkoutList workouts={workouts} isCoach={false} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching archived workouts:', error);
    redirect('/workout');
  }
} 