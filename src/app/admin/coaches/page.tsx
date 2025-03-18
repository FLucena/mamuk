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

export const dynamic = 'force-dynamic';

interface CoachData {
  _id: string | { toString(): string };
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
    image?: string;
  } | string;
  specialties?: string[];
  bio?: string;
  customers?: Array<{
    _id?: string;
    name?: string;
    email?: string;
    image?: string;
  }>;
}

export default async function CoachesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/coaches');
  }

  // Enhanced debugging - log all session details
  console.log('============ SESSION DEBUG ============');
  console.log('Session user:', JSON.stringify(session.user, null, 2));
  console.log('User roles:', session.user.roles);
  console.log('Has admin role?', session.user.roles.includes('admin'));
  console.log('Role type:', typeof session.user.roles);
  console.log('Roles is array?', Array.isArray(session.user.roles));
  if (Array.isArray(session.user.roles)) {
    console.log('Roles length:', session.user.roles.length);
    console.log('Roles contents:', session.user.roles.map(r => `"${r}"`).join(', '));
  }
  console.log('======================================');
  
  // TEMPORARY: Allow access even without admin role for development
  // Comment or remove this code when going to production
  const isDev = process.env.NODE_ENV === 'development';
  
  // Helper function to check for role presence with case insensitivity
  const hasRole = (roles: string[], role: string): boolean => {
    if (!Array.isArray(roles)) return false;
    return roles.some(r => typeof r === 'string' && r.toLowerCase() === role.toLowerCase());
  };
  
  // Check if user has admin or coach role with better error tolerance
  const isAdmin = hasRole(session.user.roles, 'admin');
  const isCoach = hasRole(session.user.roles, 'coach');
  
  console.log('Case-insensitive role check - Is admin?', isAdmin);
  console.log('Case-insensitive role check - Is coach?', isCoach);
  
  if (isDev || isAdmin || isCoach) {
    const coachesData = await getAllCoaches();
    
    // Transformar los datos de los coaches al formato User
    const formattedCoaches: User[] = coachesData.map((coach: CoachData) => ({
      _id: typeof coach._id === 'string' ? coach._id : coach._id.toString(),
      name: typeof coach.userId === 'object' && coach.userId?.name ? coach.userId.name : 'Sin nombre',
      email: typeof coach.userId === 'object' && coach.userId?.email ? coach.userId.email : 'Sin email',
      roles: ['coach'],
      image: typeof coach.userId === 'object' && coach.userId?.image ? coach.userId.image : undefined,
    }));
  
    return (
      <div className="container mx-auto px-4 py-8">
        {!session.user.roles.includes('admin') && isDev && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Desarrollo:</strong> Acceso temporal permitido. En producción, necesitarás el rol de administrador.
                </p>
              </div>
            </div>
          </div>
        )}
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

  // Only show this message in production or if truly unauthorized
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              <strong>Roles actuales:</strong> {Array.isArray(session.user.roles) 
                ? session.user.roles.join(', ') || 'ninguno' 
                : `Formato incorrecto: ${typeof session.user.roles}`}
            </p>
            <p className="text-sm text-yellow-700">
              <strong>ID de usuario:</strong> {session.user.id}
            </p>
            <p className="text-sm text-yellow-700">
              <strong>Email:</strong> {session.user.email}
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              El rol de administrador ('admin') es necesario para acceder a esta página.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 