import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getCoachByUserId } from '@/lib/services/coach';
import { getWorkoutsByUserId } from '@/lib/services/workout';
import WorkoutList from '@/components/workout/WorkoutList';

interface CustomerWorkoutsPageProps {
  params: {
    customerId: string;
  };
}

export default async function CustomerWorkoutsPage({ params }: CustomerWorkoutsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'coach') {
    redirect('/auth/signin');
  }

  const coach = await getCoachByUserId(session.user.id);
  if (!coach) {
    redirect('/');
  }

  // Verificar que el cliente pertenece al coach
  const isCustomerOfCoach = coach.customers.some(
    (customer) => customer._id === params.customerId
  );

  if (!isCustomerOfCoach) {
    redirect('/coach/customers');
  }

  const workoutsData = await getWorkoutsByUserId(params.customerId);
  const customer = coach.customers.find(
    (customer) => customer._id === params.customerId
  );

  // Adaptar los workouts al formato esperado por WorkoutList
  const workouts = workoutsData.map(workout => ({
    _id: workout.id || '',
    name: workout.name,
    description: workout.description,
    days: workout.days.map(day => ({
      _id: day.id || '',
      name: day.name,
      blocks: day.blocks.map(block => ({
        _id: block.id || '',
        name: block.name,
        exercises: block.exercises.map(exercise => ({
          _id: exercise.id || '',
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          notes: exercise.notes,
          videoUrl: exercise.videoUrl
        }))
      }))
    })),
    userId: workout.userId,
    createdAt: workout.createdAt,
    updatedAt: workout.updatedAt,
    id: workout.id
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Rutinas de {customer?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aquí puedes ver y gestionar las rutinas de tu cliente.
        </p>
      </div>

      <WorkoutList workouts={workouts} isCoach={true} />
    </div>
  );
} 