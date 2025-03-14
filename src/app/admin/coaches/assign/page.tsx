import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AssignCustomersToCoach from '@/components/admin/AssignCustomersToCoach';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f3f4f6',
  colorScheme: 'light'
};

export default async function AssignCustomersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.roles.includes('admin')) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Asignar Clientes a Coaches
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aquí puedes asignar clientes a los coaches de la plataforma.
        </p>
      </div>

      <AssignCustomersToCoach />
    </div>
  );
} 