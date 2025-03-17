import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAllCoaches } from '@/lib/services/coach';
import CoachList from '@/components/admin/CoachList';
import type { Viewport } from 'next';
import { User } from '@/lib/types/user';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f3f4f6',
  colorScheme: 'light'
};

export default async function CoachesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const coachesData = await getAllCoaches();
  
  // Transformar los datos de los coaches al formato User
  const formattedCoaches: User[] = coachesData.map((coach: any) => ({
    _id: coach._id.toString(),
    name: coach.userId?.name || 'Sin nombre',
    email: coach.userId?.email || 'Sin email',
    roles: ['coach'],
    image: coach.userId?.image || null,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Gestionar Coaches
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aquí puedes ver y gestionar los coaches de la plataforma.
          </p>
        </div>
        <Link 
          href="/admin/coaches/assign" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Asignar Clientes
        </Link>
      </div>

      <CoachList users={formattedCoaches} />
    </div>
  );
} 