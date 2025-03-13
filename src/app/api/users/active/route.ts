import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActiveUsers } from '@/lib/services/user';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    // Removed console.log
    const session = await getServerSession(authOptions);

    console.log('[API] /api/users/active - Información de sesión:', {
      userId: session?.user?.id,
      email: session?.user?.email,
      roles: session?.user?.roles
    });

    if (!session?.user?.id) {
      // Removed console.log
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admins y coaches pueden ver la lista de usuarios
    if (!session.user.roles?.includes('admin') && !session.user.roles?.includes('coach')) {
      // Removed console.log
      return NextResponse.json({ 
        error: 'Permisos insuficientes. Se requiere rol de administrador o coach para ver usuarios.' 
      }, { status: 403 });
    }

    // Removed console.log
    const users = await getActiveUsers();
    // Removed console.log
    
    // Asegurarse de que devolvemos un array vacío si no hay usuarios
    if (!users || !Array.isArray(users)) {
      // Removed console.log
      return NextResponse.json([]);
    }
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('[API] /api/users/active - Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 