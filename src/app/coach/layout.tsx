import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Verificar que el usuario es coach
  if (session.user.role !== 'coach') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="bg-gray-900 shadow-lg mb-8 rounded-lg">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-start items-center">
              <div className="flex space-x-1">
                <Link
                  href="/coach"
                  className="px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/coach/customers"
                  className="px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Mis Clientes
                </Link>
                <Link
                  href="/workout"
                  className="px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Mis Rutinas
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="bg-white shadow-sm rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 