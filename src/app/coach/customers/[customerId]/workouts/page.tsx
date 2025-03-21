import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getCoachByUserId } from '@/lib/services/coach';
import { getWorkoutsByUserId } from '@/lib/services/workout';
import WorkoutList from '@/components/workout/WorkoutList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface CustomerWorkoutsPageProps {
  params: Promise<{
    customerId: string;
  }>;
}

export default async function CustomerWorkoutsPage({ params }: CustomerWorkoutsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.roles.includes('coach') && !session.user.roles.includes('admin')) {
    redirect('/auth/signin');
  }

  const { customerId } = await params;
  
  const coach = await getCoachByUserId(session.user.id);
  
  // For coaches, we need a coach profile
  if (session.user.roles.includes('coach') && !coach) {
    redirect('/');
  }

  // For coaches, verify that the customer belongs to the coach
  // Admins can access any customer's workouts
  if (session.user.roles.includes('coach') && coach) {
    const isCustomerOfCoach = coach.customers.some(
      (customer) => customer._id === customerId
    );

    if (!isCustomerOfCoach) {
      redirect('/coach/customers');
    }
  }

  const workoutsData = await getWorkoutsByUserId(customerId);
  
  // Get customer info - for admins, we might not have coach.customers
  let customer;
  if (coach) {
    customer = coach.customers.find(
      (customer) => customer._id === customerId
    );
  }

  // Adaptar los workouts al formato esperado por WorkoutList
  const workouts = workoutsData.map(workout => ({
    id: workout.id || '',
    name: workout.name,
    description: workout.description,
    days: workout.days.map(day => ({
      id: day.id || '',
      name: day.name,
      blocks: day.blocks.map(block => ({
        id: block.id || '',
        name: block.name,
        exercises: block.exercises.map(exercise => ({
          id: exercise.id || '',
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          notes: exercise.notes || '',
          videoUrl: exercise.videoUrl || '',
          tags: exercise.tags || []
        }))
      }))
    })),
    userId: workout.userId,
    createdAt: workout.createdAt,
    updatedAt: workout.updatedAt
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rutinas de {customer?.name || 'Cliente'}
          </h1>
          <Link
            href={`/coach/customers/${customerId}/workouts/new`}
            className="inline-flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Crear Rutina
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-200">
          Aquí puedes ver y gestionar las rutinas de tu cliente.
        </p>
      </div>

      <WorkoutList workouts={workouts} isCoach={true} />
      
    </div>
  );
} 