import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoachByUserId } from '@/lib/services/coach';
import Link from 'next/link';

export default async function CoachDashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Authentication is already handled in the layout
  // But we still need to check for session to satisfy TypeScript
  if (!session?.user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600">Sesión no encontrada</h2>
        <p className="mt-2">Por favor, inicia sesión para acceder a esta página.</p>
      </div>
    );
  }
  
  const coachData = await getCoachByUserId(session.user.id);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Panel de Coach</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Mis Clientes</h2>
          <p className="text-gray-600 mb-4">
            Gestiona tus clientes y crea rutinas personalizadas para ellos.
          </p>
          <div className="mt-4">
            <Link 
              href="/coach/customers" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ver Clientes
            </Link>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {coachData?.customers?.length || 0} clientes asignados
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Mis Rutinas</h2>
          <p className="text-gray-600 mb-4">
            Accede a todas las rutinas que has creado para tus clientes.
          </p>
          <div className="mt-4">
            <Link 
              href="/workout" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ver Rutinas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 