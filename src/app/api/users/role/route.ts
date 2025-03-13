import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCurrentUserRoles } from '@/lib/utils/permissions';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


/**
 * Endpoint para obtener los roles actuales de un usuario por su email
 * Requiere autenticación y solo puede obtener los roles del usuario autenticado
 * @param req La solicitud que contiene el email del usuario
 * @returns Los roles del usuario
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el email del query string
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    // Verificar que el email pertenece al usuario autenticado
    if (!email || email !== session.user.email) {
      return NextResponse.json(
        { error: 'No autorizado para ver esta información' },
        { status: 403 }
      );
    }

    // Obtener los roles actualizados desde la base de datos
    const roles = await getCurrentUserRoles(email);

    if (!roles || roles.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o sin roles asignados' },
        { status: 404 }
      );
    }

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Error getting user roles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 