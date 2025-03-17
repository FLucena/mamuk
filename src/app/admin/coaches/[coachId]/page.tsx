import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getCoachById } from '@/lib/services/coach';
import { validateMongoId } from '@/lib/utils/security';
import CoachDetails from '@/components/admin/CoachDetails';
import type { Viewport } from 'next';

interface CoachPageProps {
  params: Promise<{
    coachId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}

// Definir una interfaz para el coach de MongoDB
interface MongoDBCoach {
  _id: { toString(): string };
  userId?: {
    _id?: { toString(): string };
    name?: string;
    email?: string;
    image?: string;
  };
  specialties?: string[];
  bio?: string;
  customers?: Array<{
    _id?: { toString(): string };
    name?: string;
    email?: string;
    image?: string;
  }>;
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f3f4f6',
  colorScheme: 'light'
};

export default async function CoachPage({ params }: CoachPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { coachId } = await params;

  if (!validateMongoId(coachId)) {
    redirect('/admin/coaches');
  }

  const coachData = await getCoachById(coachId);
  if (!coachData) {
    redirect('/admin/coaches');
  }

  // Transformar los datos al formato esperado por el componente CoachDetails
  const coach = {
    id: (coachData as MongoDBCoach)._id.toString(),
    userId: {
      _id: (coachData as MongoDBCoach).userId?._id?.toString() || '',
      name: (coachData as MongoDBCoach).userId?.name || 'Sin nombre',
      email: (coachData as MongoDBCoach).userId?.email || 'Sin email',
      image: (coachData as MongoDBCoach).userId?.image
    },
    specialties: (coachData as MongoDBCoach).specialties || [],
    biography: (coachData as MongoDBCoach).bio || '',
    customers: ((coachData as MongoDBCoach).customers || []).map((customer) => ({
      id: customer._id?.toString() || '',
      name: customer.name || 'Sin nombre',
      email: customer.email || 'Sin email',
      image: customer.image
    }))
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Detalles del Coach
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aquí puedes ver y gestionar los detalles del coach.
        </p>
      </div>

      <CoachDetails coach={coach} />
    </div>
  );
} 