import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCurrentUserRole } from '@/lib/utils/permissions';

/**
 * Endpoint para obtener el rol actual de un usuario por su email
 * Requiere autenticación y solo puede obtener el rol del usuario autenticado
 * @param req La solicitud que contiene el email del usuario
 * @returns El rol del usuario
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

    // Obtener el rol actualizado desde la base de datos
    const role = await getCurrentUserRole(email);

    if (!role) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 