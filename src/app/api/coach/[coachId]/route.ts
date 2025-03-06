import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoachById, updateCoach, addCustomerToCoach, removeCustomerFromCoach } from '@/lib/services/coach';
import { validateMongoId } from '@/lib/utils/security';

interface RouteParams {
  params: {
    coachId: string;
  };
}

interface Customer {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const coach = await getCoachById(params.coachId);
    if (!coach) {
      return NextResponse.json({ error: 'Coach no encontrado' }, { status: 404 });
    }

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error obteniendo coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es admin
    const user = session.user as any;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar coaches' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { specialties, biography } = data;
    
    const coach = await updateCoach({
      coachId: params.coachId,
      specialties,
      biography
    });
    
    if (!coach) {
      return NextResponse.json({ error: 'Coach no encontrado' }, { status: 404 });
    }

    return NextResponse.json(coach);
  } catch (error: any) {
    console.error('Error actualizando coach:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es admin
    const user = session.user as any;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para gestionar clientes' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { customerId, action } = data;

    if (!customerId || !action) {
      return NextResponse.json(
        { error: 'Se requiere customerId y action' },
        { status: 400 }
      );
    }

    let coach;
    if (action === 'assign') {
      coach = await addCustomerToCoach({
        coachId: params.coachId,
        customerId
      });
    } else if (action === 'remove') {
      coach = await removeCustomerFromCoach({
        coachId: params.coachId,
        customerId
      });
    } else {
      return NextResponse.json(
        { error: 'Acción no válida' },
        { status: 400 }
      );
    }

    return NextResponse.json(coach);
  } catch (error: any) {
    console.error('Error gestionando cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 