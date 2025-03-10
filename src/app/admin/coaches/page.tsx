import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAllCoaches } from '@/lib/services/coach';
import CoachList from '@/components/admin/CoachList';
import type { Viewport } from 'next';
import { MongoUser } from '@/lib/types/user';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f3f4f6',
  colorScheme: 'light'
};

export default async function CoachesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  const coachesData = await getAllCoaches();
  
  // Transformar los datos de los coaches al formato MongoUser
  const formattedCoaches: MongoUser[] = coachesData.map((coach: any) => ({
    _id: coach._id.toString(),
    name: coach.userId?.name || 'Sin nombre',
    email: coach.userId?.email || 'Sin email',
    role: 'coach' as const,
    roles: ['coach'],
    image: coach.userId?.image
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Gestionar Coaches
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aquí puedes ver y gestionar los coaches de la plataforma.
        </p>
      </div>

      <CoachList users={formattedCoaches} />
    </div>
  );
} 