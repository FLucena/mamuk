import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActiveUsers } from '@/lib/services/user';

export async function GET() {
  try {
    console.log('[API] /api/users/active - Iniciando solicitud');
    const session = await getServerSession(authOptions);

    console.log('[API] /api/users/active - Información de sesión:', {
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    });

    if (!session?.user?.id) {
      console.log('[API] /api/users/active - No autorizado: Sin sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admins y coaches pueden ver la lista de usuarios
    if (session.user.role !== 'admin' && session.user.role !== 'coach') {
      console.log('[API] /api/users/active - Permisos insuficientes, rol:', session.user.role);
      return NextResponse.json({ 
        error: 'Permisos insuficientes. Se requiere rol de administrador o coach para ver usuarios.' 
      }, { status: 403 });
    }

    console.log('[API] /api/users/active - Solicitando usuarios activos');
    const users = await getActiveUsers();
    console.log('[API] /api/users/active - Usuarios encontrados:', users.length);
    
    // Asegurarse de que devolvemos un array vacío si no hay usuarios
    if (!users || !Array.isArray(users)) {
      console.log('[API] /api/users/active - No se recibió un array válido de usuarios');
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