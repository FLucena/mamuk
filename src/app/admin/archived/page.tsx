import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ArchivedRoutines from '@/components/admin/ArchivedRoutines';

async function getArchivedRoutines() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/routines/archived`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch archived routines');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching archived routines:', error);
    return [];
  }
}

export default async function ArchivedRoutinesPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin?error=AccessDenied');
  }

  const archivedRoutines = await getArchivedRoutines();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Rutinas Archivadas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualiza y gestiona las rutinas archivadas.
        </p>
      </div>
      
      <ArchivedRoutines routines={archivedRoutines} />
    </div>
  );
} 