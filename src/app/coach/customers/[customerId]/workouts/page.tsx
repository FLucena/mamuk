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

  const workouts = await getWorkoutsByUserId(params.customerId);
  const customer = coach.customers.find(
    (customer) => customer._id === params.customerId
  );

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