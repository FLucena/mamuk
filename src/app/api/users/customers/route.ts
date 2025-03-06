import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCustomers } from '@/lib/services/user';

export async function GET() {
  try {
    console.log('[API] /api/users/customers - Iniciando solicitud');
    const session = await getServerSession(authOptions);

    console.log('[API] /api/users/customers - Información de sesión:', {
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    });

    if (!session?.user?.id) {
      console.log('[API] /api/users/customers - No autorizado: Sin sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admins y coaches pueden ver la lista de clientes
    if (session.user.role !== 'admin' && session.user.role !== 'coach') {
      console.log('[API] /api/users/customers - Permisos insuficientes, rol:', session.user.role);
      return NextResponse.json({ 
        error: 'Permisos insuficientes. Se requiere rol de administrador o coach para ver clientes.' 
      }, { status: 403 });
    }

    console.log('[API] /api/users/customers - Solicitando clientes');
    const customers = await getCustomers();
    console.log('[API] /api/users/customers - Clientes encontrados:', customers.length);
    
    // Asegurarse de que devolvemos un array vacío si no hay clientes
    if (!customers || !Array.isArray(customers)) {
      console.log('[API] /api/users/customers - No se recibió un array válido de clientes');
      return NextResponse.json([]);
    }
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('[API] /api/users/customers - Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 